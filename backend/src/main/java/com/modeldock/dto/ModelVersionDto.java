package com.modeldock.dto;

import com.modeldock.model.ModelVersion;
import java.time.Instant;

public class ModelVersionDto {
    private Long id;
    private String version;
    private String status;
    private String artifactPath;
    private String inputSchema;
    private String outputSchema;
    private String inputShape;
    private String outputShape;
    private Long fileSizeBytes;
    private Instant createdAt;

    public ModelVersionDto() {}

    public ModelVersionDto(ModelVersion v) {
        this.id = v.getId();
        this.version = v.getVersion();
        this.status = v.getStatus();
        this.artifactPath = v.getArtifactPath();
        this.inputSchema = v.getInputSchema();
        this.outputSchema = v.getOutputSchema();
        this.inputShape = v.getInputShape();
        this.outputShape = v.getOutputShape();
        this.fileSizeBytes = v.getFileSizeBytes();
        this.createdAt = v.getCreatedAt();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getArtifactPath() { return artifactPath; }
    public void setArtifactPath(String artifactPath) { this.artifactPath = artifactPath; }

    public String getInputSchema() { return inputSchema; }
    public void setInputSchema(String inputSchema) { this.inputSchema = inputSchema; }

    public String getOutputSchema() { return outputSchema; }
    public void setOutputSchema(String outputSchema) { this.outputSchema = outputSchema; }

    public String getInputShape() { return inputShape; }
    public void setInputShape(String inputShape) { this.inputShape = inputShape; }

    public String getOutputShape() { return outputShape; }
    public void setOutputShape(String outputShape) { this.outputShape = outputShape; }

    public Long getFileSizeBytes() { return fileSizeBytes; }
    public void setFileSizeBytes(Long fileSizeBytes) { this.fileSizeBytes = fileSizeBytes; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
