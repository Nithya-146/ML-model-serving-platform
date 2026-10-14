package com.modeldock.controller;

import com.modeldock.dto.PredictRequest;
import com.modeldock.dto.PredictResponse;
import com.modeldock.service.InferenceService;
import com.modeldock.service.RateLimitingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/predict")
@Tag(name = "Inference API", description = "High-throughput prediction endpoints with schema validation and canary routing")
public class InferenceController {

    private final InferenceService inferenceService;
    private final RateLimitingService rateLimitingService;

    public InferenceController(InferenceService inferenceService, RateLimitingService rateLimitingService) {
        this.inferenceService = inferenceService;
        this.rateLimitingService = rateLimitingService;
    }

    @PostMapping("/{model}/{version}")
    @Operation(summary = "Invoke prediction directly on a specific model version")
    public ResponseEntity<?> predictSpecificVersion(
            @PathVariable String model,
            @PathVariable String version,
            @Valid @RequestBody PredictRequest request,
            HttpServletRequest servletRequest) {

        String clientIp = extractClientIp(servletRequest);

        if (!rateLimitingService.tryAcquire(clientIp)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body("Rate limit exceeded for client: " + clientIp);
        }

        try {
            PredictResponse response = inferenceService.predictSpecificVersion(model, version, request, clientIp);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{model}")
    @Operation(summary = "Invoke prediction through dynamic traffic routing (A/B or Canary)")
    public ResponseEntity<?> predictRouted(
            @PathVariable String model,
            @Valid @RequestBody PredictRequest request,
            HttpServletRequest servletRequest) {

        String clientIp = extractClientIp(servletRequest);

        if (!rateLimitingService.tryAcquire(clientIp)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body("Rate limit exceeded for client: " + clientIp);
        }

        try {
            PredictResponse response = inferenceService.predictRouted(model, request, clientIp);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private String extractClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty() || !xfHeader.contains(",")) {
            return request.getRemoteAddr() != null ? request.getRemoteAddr() : "127.0.0.1";
        }
        return xfHeader.split(",")[0].trim();
    }
}
