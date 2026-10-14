package com.modeldock.controller;

import com.modeldock.dto.MetricsSummaryDto;
import com.modeldock.service.MetricsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/metrics")
@Tag(name = "Metrics & Health", description = "Micrometer and Prometheus aggregated telemetry")
public class MetricsController {

    private final MetricsService metricsService;

    public MetricsController(MetricsService metricsService) {
        this.metricsService = metricsService;
    }

    @GetMapping("/summary")
    @Operation(summary = "Get high-level telemetry summary: p50/p95/p99 latency, throughput, error rates")
    public ResponseEntity<MetricsSummaryDto> getMetricsSummary() {
        return ResponseEntity.ok(metricsService.getSummaryMetrics());
    }
}
