package com.modeldock.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.Map;

public class ModelCreateRequest {

    @NotBlank(message = "Model name is required")
    private String name;

    private String description;

    private String framework = "ONNX";

    @NotBlank(message = "Version is required")
    private String version;

    private String status = "ACTIVE";

    private Map<String, Object> inputSchema;
    private Map<String, Object> outputSchema;

    private String inputShape = "[-1, 4]";
    private String outputShape = "[-1, 1]";

    public ModelCreateRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getFramework() { return framework; }
    public void setFramework(String framework) { this.framework = framework; }

    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Map<String, Object> getInputSchema() { return inputSchema; }
    public void setInputSchema(Map<String, Object> inputSchema) { this.inputSchema = inputSchema; }

    public Map<String, Object> getOutputSchema() { return outputSchema; }
    public void setOutputSchema(Map<String, Object> outputSchema) { this.outputSchema = outputSchema; }

    public String getInputShape() { return inputShape; }
    public void setInputShape(String inputShape) { this.inputShape = inputShape; }

    public String getOutputShape() { return outputShape; }
    public void setOutputShape(String outputShape) { this.outputShape = outputShape; }
}
