package com.modeldock.dto;

import java.time.Instant;

public class PredictResponse {

    private String requestId;
    private String model;
    private String version;
    private Double latencyMs;
    private Object predictions;
    private Double confidence;
    private String routedBy;
    private Boolean cacheHit;
    private Instant timestamp;

    public PredictResponse() {}

    public PredictResponse(String requestId, String model, String version, Double latencyMs, 
                           Object predictions, Double confidence, String routedBy, Boolean cacheHit) {
        this.requestId = requestId;
        this.model = model;
        this.version = version;
        this.latencyMs = latencyMs;
        this.predictions = predictions;
        this.confidence = confidence;
        this.routedBy = routedBy;
        this.cacheHit = cacheHit;
        this.timestamp = Instant.now();
    }

    public String getRequestId() { return requestId; }
    public void setRequestId(String requestId) { this.requestId = requestId; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }

    public Double getLatencyMs() { return latencyMs; }
    public void setLatencyMs(Double latencyMs) { this.latencyMs = latencyMs; }

    public Object getPredictions() { return predictions; }
    public void setPredictions(Object predictions) { this.predictions = predictions; }

    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }

    public String getRoutedBy() { return routedBy; }
    public void setRoutedBy(String routedBy) { this.routedBy = routedBy; }

    public Boolean getCacheHit() { return cacheHit; }
    public void setCacheHit(Boolean cacheHit) { this.cacheHit = cacheHit; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
}
