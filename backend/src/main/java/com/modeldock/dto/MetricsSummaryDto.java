package com.modeldock.dto;

import java.util.Map;

public class MetricsSummaryDto {
    private Double p50LatencyMs;
    private Double p95LatencyMs;
    private Double p99LatencyMs;
    private Double avgLatencyMs;
    private Double requestsPerSecond;
    private Double errorRatePercentage;
    private Long totalRequests;
    private Long activeModels;
    private Double cacheHitRatePercentage;
    private Map<String, Long> requestsPerVersion;

    public MetricsSummaryDto() {}

    public Double getP50LatencyMs() { return p50LatencyMs; }
    public void setP50LatencyMs(Double p50LatencyMs) { this.p50LatencyMs = p50LatencyMs; }

    public Double getP95LatencyMs() { return p95LatencyMs; }
    public void setP95LatencyMs(Double p95LatencyMs) { this.p95LatencyMs = p95LatencyMs; }

    public Double getP99LatencyMs() { return p99LatencyMs; }
    public void setP99LatencyMs(Double p99LatencyMs) { this.p99LatencyMs = p99LatencyMs; }

    public Double getAvgLatencyMs() { return avgLatencyMs; }
    public void setAvgLatencyMs(Double avgLatencyMs) { this.avgLatencyMs = avgLatencyMs; }

    public Double getRequestsPerSecond() { return requestsPerSecond; }
    public void setRequestsPerSecond(Double requestsPerSecond) { this.requestsPerSecond = requestsPerSecond; }

    public Double getErrorRatePercentage() { return errorRatePercentage; }
    public void setErrorRatePercentage(Double errorRatePercentage) { this.errorRatePercentage = errorRatePercentage; }

    public Long getTotalRequests() { return totalRequests; }
    public void setTotalRequests(Long totalRequests) { this.totalRequests = totalRequests; }

    public Long getActiveModels() { return activeModels; }
    public void setActiveModels(Long activeModels) { this.activeModels = activeModels; }

    public Double getCacheHitRatePercentage() { return cacheHitRatePercentage; }
    public void setCacheHitRatePercentage(Double cacheHitRatePercentage) { this.cacheHitRatePercentage = cacheHitRatePercentage; }

    public Map<String, Long> getRequestsPerVersion() { return requestsPerVersion; }
    public void setRequestsPerVersion(Map<String, Long> requestsPerVersion) { this.requestsPerVersion = requestsPerVersion; }
}
