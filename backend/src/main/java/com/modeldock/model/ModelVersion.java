package com.modeldock.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "model_versions", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"model_id", "version"})
})
public class ModelVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "model_id", nullable = false)
    @JsonIgnore
    private ModelEntity model;

    @Column(nullable = false, length = 50)
    private String version;

    @Column(nullable = false, length = 30)
    private String status = "ACTIVE"; // ACTIVE, CANARY, STAGING, ARCHIVED

    @Column(length = 500)
    private String artifactPath;

    @Column(columnDefinition = "TEXT")
    private String inputSchema;

    @Column(columnDefinition = "TEXT")
    private String outputSchema;

    @Column(length = 100)
    private String inputShape = "[-1, 4]";

    @Column(length = 100)
    private String outputShape = "[-1, 1]";

    private Long fileSizeBytes = 0L;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public ModelVersion() {}

    public ModelVersion(ModelEntity model, String version, String status, String artifactPath, 
                        String inputSchema, String outputSchema, String inputShape, String outputShape, Long fileSizeBytes) {
        this.model = model;
        this.version = version;
        this.status = status;
        this.artifactPath = artifactPath;
        this.inputSchema = inputSchema;
        this.outputSchema = outputSchema;
        this.inputShape = inputShape;
        this.outputShape = outputShape;
        this.fileSizeBytes = fileSizeBytes;
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ModelEntity getModel() { return model; }
    public void setModel(ModelEntity model) { this.model = model; }

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
