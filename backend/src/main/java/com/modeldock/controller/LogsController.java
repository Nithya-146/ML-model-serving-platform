package com.modeldock.controller;

import com.modeldock.model.InferenceLog;
import com.modeldock.repository.InferenceLogRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/logs")
@Tag(name = "Inference Logs", description = "Query, filter, and inspect prediction request logs")
public class LogsController {

    private final InferenceLogRepository logRepository;

    public LogsController(InferenceLogRepository logRepository) {
        this.logRepository = logRepository;
    }

    @GetMapping
    @Operation(summary = "Search and filter inference logs by model, version, status code, and pagination")
    public ResponseEntity<Page<InferenceLog>> getLogs(
            @RequestParam(required = false) String model,
            @RequestParam(required = false) String version,
            @RequestParam(required = false) Integer status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size) {

        PageRequest pageRequest = PageRequest.of(page, Math.min(size, 100), Sort.by(Sort.Direction.DESC, "timestamp"));
        Page<InferenceLog> logs = logRepository.findWithFilters(model, version, status, pageRequest);

        return ResponseEntity.ok(logs);
    }
}
