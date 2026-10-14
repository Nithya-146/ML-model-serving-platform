package com.modeldock.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.modeldock.dto.TrafficRouteDto;
import com.modeldock.model.ModelEntity;
import com.modeldock.model.TrafficRoute;
import com.modeldock.repository.ModelRepository;
import com.modeldock.repository.TrafficRouteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class TrafficRoutingService {

    private static final Logger log = LoggerFactory.getLogger(TrafficRoutingService.class);

    private final TrafficRouteRepository routeRepository;
    private final ModelRepository modelRepository;
    private final ObjectMapper objectMapper;

    public record RoutingDecision(String selectedVersion, String routingReason) {}

    public TrafficRoutingService(TrafficRouteRepository routeRepository, 
                                 ModelRepository modelRepository, 
                                 ObjectMapper objectMapper) {
        this.routeRepository = routeRepository;
        this.modelRepository = modelRepository;
        this.objectMapper = objectMapper;
    }

    public RoutingDecision resolveVersion(String modelName) {
        Optional<TrafficRoute> routeOpt = routeRepository.findByModelName(modelName);

        if (routeOpt.isEmpty() || Boolean.FALSE.equals(routeOpt.get().getIsEnabled())) {
            // Default to model active version
            String defaultVersion = modelRepository.findByName(modelName)
                    .map(ModelEntity::getActiveVersion)
                    .orElse("v1.0.0");
            return new RoutingDecision(defaultVersion, "DIRECT (Default)");
        }

        TrafficRoute route = routeOpt.get();
        Map<String, Integer> weights = parseWeights(route.getVersionWeightsJson());

        if (weights.isEmpty()) {
            return new RoutingDecision("v1.0.0", "DIRECT (Fallback)");
        }

        // Weighted random selection
        int totalWeight = weights.values().stream().mapToInt(Integer::intValue).sum();
        if (totalWeight <= 0) totalWeight = 100;

        int randomPoint = ThreadLocalRandom.current().nextInt(totalWeight);
        int cumulative = 0;

        for (Map.Entry<String, Integer> entry : weights.entrySet()) {
            cumulative += entry.getValue();
            if (randomPoint < cumulative) {
                String reason = String.format("%s (%d%%)", route.getRoutingStrategy(), entry.getValue());
                return new RoutingDecision(entry.getKey(), reason);
            }
        }

        // Fallback to first entry
        String firstKey = weights.keySet().iterator().next();
        return new RoutingDecision(firstKey, route.getRoutingStrategy());
    }

    public List<TrafficRouteDto> getAllRoutes() {
        return routeRepository.findAll().stream()
                .map(r -> new TrafficRouteDto(r, parseWeights(r.getVersionWeightsJson())))
                .toList();
    }

    public Optional<TrafficRouteDto> getRouteForModel(String modelName) {
        return routeRepository.findByModelName(modelName)
                .map(r -> new TrafficRouteDto(r, parseWeights(r.getVersionWeightsJson())));
    }

    @Transactional
    public TrafficRouteDto updateRoute(String modelName, String strategy, Map<String, Integer> weights) {
        // Validate weights sum
        int sum = weights.values().stream().mapToInt(Integer::intValue).sum();
        if (sum != 100) {
            throw new IllegalArgumentException("Traffic weights must sum to exactly 100%, current sum: " + sum);
        }

        String json;
        try {
            json = objectMapper.writeValueAsString(weights);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize weights", e);
        }

        TrafficRoute route = routeRepository.findByModelName(modelName)
                .orElse(new TrafficRoute(modelName, strategy != null ? strategy : "AB_SPLIT", json));

        if (strategy != null) {
            route.setRoutingStrategy(strategy);
        }
        route.setVersionWeightsJson(json);
        route.setUpdatedAt(Instant.now());

        TrafficRoute saved = routeRepository.save(route);
        return new TrafficRouteDto(saved, weights);
    }

    public Map<String, Integer> parseWeights(String json) {
        if (json == null || json.isBlank()) return Collections.emptyMap();
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Integer>>() {});
        } catch (Exception e) {
            log.error("Failed to parse version weights JSON: {}", json, e);
            return Collections.emptyMap();
        }
    }
}
