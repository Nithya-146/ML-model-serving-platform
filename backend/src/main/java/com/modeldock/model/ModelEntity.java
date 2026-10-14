package com.modeldock.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "models")
public class ModelEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 50)
    private String framework = "ONNX";

    @Column(nullable = false, length = 50)
    private String activeVersion = "v1.0.0";

    @Column(nullable = false)
    private String status = "READY"; // READY, DEPLOYING, DEGRADED, OFFLINE

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    @OneToMany(mappedBy = "model", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ModelVersion> versions = new ArrayList<>();

    public ModelEntity() {}

    public ModelEntity(String name, String description, String framework, String activeVersion) {
        this.name = name;
        this.description = description;
        this.framework = framework;
        this.activeVersion = activeVersion;
        this.status = "READY";
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getFramework() { return framework; }
    public void setFramework(String framework) { this.framework = framework; }

    public String getActiveVersion() { return activeVersion; }
    public void setActiveVersion(String activeVersion) { this.activeVersion = activeVersion; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public List<ModelVersion> getVersions() { return versions; }
    public void setVersions(List<ModelVersion> versions) { this.versions = versions; }
}
