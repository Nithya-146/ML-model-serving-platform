package com.modeldock.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.modeldock.dto.ModelCreateRequest;
import com.modeldock.dto.ModelDetailDto;
import com.modeldock.dto.ModelVersionDto;
import com.modeldock.model.ModelEntity;
import com.modeldock.model.ModelVersion;
import com.modeldock.repository.ModelRepository;
import com.modeldock.repository.ModelVersionRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.*;

@Service
public class ModelRegistryService {

    private static final Logger log = LoggerFactory.getLogger(ModelRegistryService.class);

    private final ModelRepository modelRepository;
    private final ModelVersionRepository versionRepository;
    private final TrafficRoutingService trafficRoutingService;
    private final ObjectMapper objectMapper;

    @Value("${modeldock.models.storage-path:./model-artifacts}")
    private String storagePath;

    public ModelRegistryService(ModelRepository modelRepository, 
                                ModelVersionRepository versionRepository,
                                TrafficRoutingService trafficRoutingService,
                                ObjectMapper objectMapper) {
        this.modelRepository = modelRepository;
        this.versionRepository = versionRepository;
        this.trafficRoutingService = trafficRoutingService;
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(Paths.get(storagePath));
            seedInitialModels();
        } catch (IOException e) {
            log.error("Failed to initialize model storage directory: {}", storagePath, e);
        }
    }

    public List<ModelDetailDto> getAllModels() {
        return modelRepository.findAll().stream()
                .map(ModelDetailDto::new)
                .toList();
    }

    public Optional<ModelDetailDto> getModel(String name) {
        return modelRepository.findByName(name)
                .map(ModelDetailDto::new);
    }

    public List<ModelVersionDto> getModelVersions(String modelName) {
        return versionRepository.findByModelName(modelName).stream()
                .map(ModelVersionDto::new)
                .toList();
    }

    public Optional<ModelVersion> getVersionEntity(String modelName, String version) {
        return versionRepository.findByModelNameAndVersion(modelName, version);
    }

    @Transactional
    public ModelDetailDto createOrUpdateModel(ModelCreateRequest request) {
        ModelEntity model = modelRepository.findByName(request.getName())
                .orElseGet(() -> {
                    ModelEntity m = new ModelEntity(
                            request.getName(),
                            request.getDescription(),
                            request.getFramework() != null ? request.getFramework() : "ONNX",
                            request.getVersion()
                    );
                    return modelRepository.save(m);
                });

        model.setDescription(request.getDescription());
        model.setActiveVersion(request.getVersion());
        model.setStatus("READY");
        model.setUpdatedAt(Instant.now());
        model = modelRepository.save(model);

        // Check if version already exists
        final ModelEntity finalModel = model;
        ModelVersion modelVersion = versionRepository.findByModelNameAndVersion(request.getName(), request.getVersion())
                .orElseGet(() -> new ModelVersion(
                        finalModel,
                        request.getVersion(),
                        request.getStatus() != null ? request.getStatus() : "ACTIVE",
                        null,
                        null,
                        null,
                        request.getInputShape(),
                        request.getOutputShape(),
                        0L
                ));

        try {
            if (request.getInputSchema() != null) {
                modelVersion.setInputSchema(objectMapper.writeValueAsString(request.getInputSchema()));
            }
            if (request.getOutputSchema() != null) {
                modelVersion.setOutputSchema(objectMapper.writeValueAsString(request.getOutputSchema()));
            }
        } catch (Exception e) {
            log.warn("Could not serialize schemas: {}", e.getMessage());
        }

        modelVersion.setStatus(request.getStatus() != null ? request.getStatus() : "ACTIVE");
        modelVersion.setInputShape(request.getInputShape());
        modelVersion.setOutputShape(request.getOutputShape());
        versionRepository.save(modelVersion);

        return new ModelDetailDto(model);
    }

    @Transactional
    public ModelVersionDto uploadModelArtifact(String modelName, String version, MultipartFile file) throws IOException {
        ModelEntity model = modelRepository.findByName(modelName)
                .orElseThrow(() -> new IllegalArgumentException("Model not found: " + modelName));

        String filename = String.format("%s_%s_%s", modelName, version, file.getOriginalFilename());
        Path targetPath = Paths.get(storagePath, filename);
        Files.copy(file.getInputStream(), targetPath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

        ModelVersion modelVersion = versionRepository.findByModelNameAndVersion(modelName, version)
                .orElseGet(() -> new ModelVersion(
                        model,
                        version,
                        "ACTIVE",
                        targetPath.toString(),
                        null,
                        null,
                        "[-1, 4]",
                        "[-1, 1]",
                        file.getSize()
                ));

        modelVersion.setArtifactPath(targetPath.toAbsolutePath().toString());
        modelVersion.setFileSizeBytes(file.getSize());
        ModelVersion saved = versionRepository.save(modelVersion);

        return new ModelVersionDto(saved);
    }

    private void seedInitialModels() {
        if (modelRepository.count() > 0) return;

        log.info("Seeding initial ML models and canary routes for ModelDock...");

        // 1. Churn Predictor (A/B Test)
        ModelEntity churn = new ModelEntity(
                "churn-predictor",
                "Customer attrition risk scoring engine based on account tenure and billing dynamics.",
                "ONNX",
                "v1.0.0"
        );
        churn = modelRepository.save(churn);

        String churnInputSchema = "{\"type\":\"object\",\"properties\":{\"tenure\":{\"type\":\"number\",\"description\":\"Months as customer\"},\"monthly_charges\":{\"type\":\"number\",\"description\":\"Monthly billing amount in USD\"},\"total_charges\":{\"type\":\"number\",\"description\":\"Lifetime charges\"},\"contract_type\":{\"type\":\"string\",\"enum\":[\"month-to-month\",\"one-year\",\"two-year\"]}},\"required\":[\"tenure\",\"monthly_charges\"]}";
        String churnOutputSchema = "{\"type\":\"object\",\"properties\":{\"churn_probability\":{\"type\":\"number\",\"minimum\":0,\"maximum\":1},\"churn_risk\":{\"type\":\"string\",\"enum\":[\"LOW\",\"MEDIUM\",\"HIGH\"]}}}";

        ModelVersion churnV1 = new ModelVersion(churn, "v1.0.0", "ACTIVE", "model-artifacts/churn_v1.onnx", churnInputSchema, churnOutputSchema, "[-1, 4]", "[-1, 1]", 1450000L);
        ModelVersion churnV2 = new ModelVersion(churn, "v2.0.0", "ACTIVE", "model-artifacts/churn_v2.onnx", churnInputSchema, churnOutputSchema, "[-1, 4]", "[-1, 1]", 2100000L);
        versionRepository.saveAll(List.of(churnV1, churnV2));
        trafficRoutingService.updateRoute("churn-predictor", "AB_SPLIT", Map.of("v1.0.0", 80, "v2.0.0", 20));

        // 2. Sentiment Analyzer (Canary)
        ModelEntity sentiment = new ModelEntity(
                "sentiment-analyzer",
                "Real-time NLP sentiment classification and polarity scoring for feedback streams.",
                "ONNX",
                "v1.0.0"
        );
        sentiment = modelRepository.save(sentiment);

        String sentInputSchema = "{\"type\":\"object\",\"properties\":{\"text\":{\"type\":\"string\",\"description\":\"Input sentence or review text\"},\"language\":{\"type\":\"string\",\"default\":\"en\"}},\"required\":[\"text\"]}";
        String sentOutputSchema = "{\"type\":\"object\",\"properties\":{\"sentiment\":{\"type\":\"string\",\"enum\":[\"POSITIVE\",\"NEUTRAL\",\"NEGATIVE\"]},\"confidence\":{\"type\":\"number\"}}}";

        ModelVersion sentV1 = new ModelVersion(sentiment, "v1.0.0", "ACTIVE", "model-artifacts/sentiment_v1.onnx", sentInputSchema, sentOutputSchema, "[-1, 128]", "[-1, 3]", 38000000L);
        ModelVersion sentV2 = new ModelVersion(sentiment, "v1.1.0", "CANARY", "model-artifacts/sentiment_v1_1.onnx", sentInputSchema, sentOutputSchema, "[-1, 128]", "[-1, 3]", 41500000L);
        versionRepository.saveAll(List.of(sentV1, sentV2));
        trafficRoutingService.updateRoute("sentiment-analyzer", "CANARY", Map.of("v1.0.0", 90, "v1.1.0", 10));

        // 3. Fraud Detection (Direct/Single)
        ModelEntity fraud = new ModelEntity(
                "fraud-detection",
                "High-throughput transactional anomaly and risk fraud classifier with sub-10ms response target.",
                "ONNX",
                "v1.0.0"
        );
        fraud = modelRepository.save(fraud);

        String fraudInputSchema = "{\"type\":\"object\",\"properties\":{\"amount\":{\"type\":\"number\"},\"country_risk\":{\"type\":\"number\"},\"velocity_score\":{\"type\":\"number\"},\"device_trust\":{\"type\":\"number\"}},\"required\":[\"amount\",\"country_risk\"]}";
        String fraudOutputSchema = "{\"type\":\"object\",\"properties\":{\"is_fraud\":{\"type\":\"boolean\"},\"risk_score\":{\"type\":\"number\"}}}";

        ModelVersion fraudV1 = new ModelVersion(fraud, "v1.0.0", "ACTIVE", "model-artifacts/fraud_v1.onnx", fraudInputSchema, fraudOutputSchema, "[-1, 8]", "[-1, 2]", 8900000L);
        versionRepository.save(fraudV1);
        trafficRoutingService.updateRoute("fraud-detection", "SINGLE", Map.of("v1.0.0", 100));

        log.info("ModelDock seed models initialized successfully!");
    }
}
