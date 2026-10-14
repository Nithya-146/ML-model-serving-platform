package com.modeldock.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "traffic_routes")
public class TrafficRoute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String modelName;

    @Column(nullable = false, length = 50)
    private String routingStrategy = "AB_SPLIT"; // AB_SPLIT, CANARY, SINGLE

    @Column(columnDefinition = "TEXT", nullable = false)
    private String versionWeightsJson = "{\"v1.0.0\": 100}";

    @Column(nullable = false)
    private Boolean isEnabled = true;

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    public TrafficRoute() {}

    public TrafficRoute(String modelName, String routingStrategy, String versionWeightsJson) {
        this.modelName = modelName;
        this.routingStrategy = routingStrategy;
        this.versionWeightsJson = versionWeightsJson;
        this.isEnabled = true;
        this.updatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getModelName() { return modelName; }
    public void setModelName(String modelName) { this.modelName = modelName; }

    public String getRoutingStrategy() { return routingStrategy; }
    public void setRoutingStrategy(String routingStrategy) { this.routingStrategy = routingStrategy; }

    public String getVersionWeightsJson() { return versionWeightsJson; }
    public void setVersionWeightsJson(String versionWeightsJson) { this.versionWeightsJson = versionWeightsJson; }

    public Boolean getIsEnabled() { return isEnabled; }
    public void setIsEnabled(Boolean isEnabled) { this.isEnabled = isEnabled; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
