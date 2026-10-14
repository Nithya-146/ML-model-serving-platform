package com.modeldock.controller;

import com.modeldock.dto.TrafficRouteDto;
import com.modeldock.service.TrafficRoutingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/traffic")
@Tag(name = "Traffic Routing", description = "Dynamic A/B testing and Canary rollout control")
public class TrafficController {

    private final TrafficRoutingService trafficRoutingService;

    public TrafficController(TrafficRoutingService trafficRoutingService) {
        this.trafficRoutingService = trafficRoutingService;
    }

    @GetMapping("/routes")
    @Operation(summary = "List all active model traffic routing rules")
    public ResponseEntity<List<TrafficRouteDto>> listRoutes() {
        return ResponseEntity.ok(trafficRoutingService.getAllRoutes());
    }

    @GetMapping("/routes/{model}")
    @Operation(summary = "Get traffic routing configuration for a specific model")
    public ResponseEntity<TrafficRouteDto> getRoute(@PathVariable String model) {
        return trafficRoutingService.getRouteForModel(model)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    public static class UpdateRoutePayload {
        private String strategy;
        private Map<String, Integer> weights;

        public UpdateRoutePayload() {}

        public String getStrategy() { return strategy; }
        public void setStrategy(String strategy) { this.strategy = strategy; }

        public Map<String, Integer> getWeights() { return weights; }
        public void setWeights(Map<String, Integer> weights) { this.weights = weights; }
    }

    @PutMapping("/routes/{model}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_DEVELOPER')")
    @Operation(summary = "Update traffic split percentages or rollout strategy for a model")
    public ResponseEntity<?> updateRoute(
            @PathVariable String model,
            @RequestBody UpdateRoutePayload payload) {
        try {
            TrafficRouteDto updated = trafficRoutingService.updateRoute(model, payload.getStrategy(), payload.getWeights());
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
