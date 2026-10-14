package com.modeldock.dto;

import com.modeldock.model.TrafficRoute;
import java.time.Instant;
import java.util.Map;

public class TrafficRouteDto {
    private Long id;
    private String modelName;
    private String routingStrategy;
    private String versionWeightsJson;
    private Map<String, Integer> weights;
    private Boolean isEnabled;
    private Instant updatedAt;

    public TrafficRouteDto() {}

    public TrafficRouteDto(TrafficRoute route, Map<String, Integer> parsedWeights) {
        this.id = route.getId();
        this.modelName = route.getModelName();
        this.routingStrategy = route.getRoutingStrategy();
        this.versionWeightsJson = route.getVersionWeightsJson();
        this.weights = parsedWeights;
        this.isEnabled = route.getIsEnabled();
        this.updatedAt = route.getUpdatedAt();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getModelName() { return modelName; }
    public void setModelName(String modelName) { this.modelName = modelName; }

    public String getRoutingStrategy() { return routingStrategy; }
    public void setRoutingStrategy(String routingStrategy) { this.routingStrategy = routingStrategy; }

    public String getVersionWeightsJson() { return versionWeightsJson; }
    public void setVersionWeightsJson(String versionWeightsJson) { this.versionWeightsJson = versionWeightsJson; }

    public Map<String, Integer> getWeights() { return weights; }
    public void setWeights(Map<String, Integer> weights) { this.weights = weights; }

    public Boolean getIsEnabled() { return isEnabled; }
    public void setIsEnabled(Boolean isEnabled) { this.isEnabled = isEnabled; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
