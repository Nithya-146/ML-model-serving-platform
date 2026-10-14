package com.modeldock.dto;

import com.modeldock.model.ModelEntity;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

public class ModelDetailDto {
    private Long id;
    private String name;
    private String description;
    private String framework;
    private String activeVersion;
    private String status;
    private Instant createdAt;
    private Instant updatedAt;
    private List<ModelVersionDto> versions;

    public ModelDetailDto() {}

    public ModelDetailDto(ModelEntity entity) {
        this.id = entity.getId();
        this.name = entity.getName();
        this.description = entity.getDescription();
        this.framework = entity.getFramework();
        this.activeVersion = entity.getActiveVersion();
        this.status = entity.getStatus();
        this.createdAt = entity.getCreatedAt();
        this.updatedAt = entity.getUpdatedAt();
        if (entity.getVersions() != null) {
            this.versions = entity.getVersions().stream()
                    .map(ModelVersionDto::new)
                    .collect(Collectors.toList());
        }
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

    public List<ModelVersionDto> getVersions() { return versions; }
    public void setVersions(List<ModelVersionDto> versions) { this.versions = versions; }
}
