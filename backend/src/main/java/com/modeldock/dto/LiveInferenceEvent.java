package com.modeldock.dto;

import java.time.Instant;

public class LiveInferenceEvent {
    private String eventId;
    private String modelName;
    private String version;
    private Double latencyMs;
    private Integer statusCode;
    private Boolean cacheHit;
    private String routingReason;
    private Double confidence;
    private Instant timestamp;

    public LiveInferenceEvent() {}

    public LiveInferenceEvent(String eventId, String modelName, String version, Double latencyMs, 
                              Integer statusCode, Boolean cacheHit, String routingReason, Double confidence) {
        this.eventId = eventId;
        this.modelName = modelName;
        this.version = version;
        this.latencyMs = latencyMs;
        this.statusCode = statusCode;
        this.cacheHit = cacheHit;
        this.routingReason = routingReason;
        this.confidence = confidence;
        this.timestamp = Instant.now();
    }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public String getModelName() { return modelName; }
    public void setModelName(String modelName) { this.modelName = modelName; }

    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }

    public Double getLatencyMs() { return latencyMs; }
    public void setLatencyMs(Double latencyMs) { this.latencyMs = latencyMs; }

    public Integer getStatusCode() { return statusCode; }
    public void setStatusCode(Integer statusCode) { this.statusCode = statusCode; }

    public Boolean getCacheHit() { return cacheHit; }
    public void setCacheHit(Boolean cacheHit) { this.cacheHit = cacheHit; }

    public String getRoutingReason() { return routingReason; }
    public void setRoutingReason(String routingReason) { this.routingReason = routingReason; }

    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
}
