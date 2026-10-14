package com.modeldock.controller;

import com.modeldock.service.EventStreamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/stream")
@Tag(name = "Telemetry Stream", description = "Server-Sent Events stream for live mission control dashboards")
public class StreamController {

    private final EventStreamService eventStreamService;

    public StreamController(EventStreamService eventStreamService) {
        this.eventStreamService = eventStreamService;
    }

    @GetMapping(value = "/events", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Subscribe to live real-time stream of inference events, latencies, and canary pulses")
    public SseEmitter streamEvents() {
        return eventStreamService.createSseEmitter();
    }
}
