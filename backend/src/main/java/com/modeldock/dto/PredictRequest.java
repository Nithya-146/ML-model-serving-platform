package com.modeldock.dto;

import jakarta.validation.constraints.NotNull;
import java.util.Map;

public class PredictRequest {

    private String requestId;

    @NotNull(message = "Inputs payload is required")
    private Map<String, Object> inputs;

    private Map<String, Object> parameters;

    public PredictRequest() {}

    public PredictRequest(Map<String, Object> inputs) {
        this.inputs = inputs;
    }

    public String getRequestId() { return requestId; }
    public void setRequestId(String requestId) { this.requestId = requestId; }

    public Map<String, Object> getInputs() { return inputs; }
    public void setInputs(Map<String, Object> inputs) { this.inputs = inputs; }

    public Map<String, Object> getParameters() { return parameters; }
    public void setParameters(Map<String, Object> parameters) { this.parameters = parameters; }
}
