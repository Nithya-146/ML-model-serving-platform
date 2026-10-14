package com.modeldock.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "inference_logs", indexes = {
    @Index(name = "idx_inf_model_ts", columnList = "modelName, timestamp DESC"),
    @Index(name = "idx_inf_status", columnList = "statusCode")
})
public class InferenceLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 64)
    private String requestId;

    @Column(nullable = false, length = 100)
    private String modelName;

    @Column(nullable = false, length = 50)
    private String version;

    @Column(nullable = false)
    private Double latencyMs;

    @Column(nullable = false)
    private Integer statusCode;

    @Column(columnDefinition = "TEXT")
    private String inputPayload;

    @Column(columnDefinition = "TEXT")
    private String outputPrediction;

    @Column(nullable = false)
    private Boolean cacheHit = false;

    @Column(length = 100)
    private String routingReason;

    @Column(length = 64)
    private String clientIp;

    @Column(nullable = false)
    private Instant timestamp = Instant.now();

    public InferenceLog() {}

    public InferenceLog(String requestId, String modelName, String version, Double latencyMs, 
                        Integer statusCode, String inputPayload, String outputPrediction, 
                        Boolean cacheHit, String routingReason, String clientIp) {
        this.requestId = requestId;
        this.modelName = modelName;
        this.version = version;
        this.latencyMs = latencyMs;
        this.statusCode = statusCode;
        this.inputPayload = inputPayload;
        this.outputPrediction = outputPrediction;
        this.cacheHit = cacheHit;
        this.routingReason = routingReason;
        this.clientIp = clientIp;
        this.timestamp = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRequestId() { return requestId; }
    public void setRequestId(String requestId) { this.requestId = requestId; }

    public String getModelName() { return modelName; }
    public void setModelName(String modelName) { this.modelName = modelName; }

    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }

    public Double getLatencyMs() { return latencyMs; }
    public void setLatencyMs(Double latencyMs) { this.latencyMs = latencyMs; }

    public Integer getStatusCode() { return statusCode; }
    public void setStatusCode(Integer statusCode) { this.statusCode = statusCode; }

    public String getInputPayload() { return inputPayload; }
    public void setInputPayload(String inputPayload) { this.inputPayload = inputPayload; }

    public String getOutputPrediction() { return outputPrediction; }
    public void setOutputPrediction(String outputPrediction) { this.outputPrediction = outputPrediction; }

    public Boolean getCacheHit() { return cacheHit; }
    public void setCacheHit(Boolean cacheHit) { this.cacheHit = cacheHit; }

    public String getRoutingReason() { return routingReason; }
    public void setRoutingReason(String routingReason) { this.routingReason = routingReason; }

    public String getClientIp() { return clientIp; }
    public void setClientIp(String clientIp) { this.clientIp = clientIp; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
}
