package com.modeldock.service;

import com.modeldock.dto.LiveInferenceEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class EventStreamService {

    private static final Logger log = LoggerFactory.getLogger(EventStreamService.class);
    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();
    private final SimpMessagingTemplate messagingTemplate;

    public EventStreamService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public SseEmitter createSseEmitter() {
        // 30 minute timeout
        SseEmitter emitter = new SseEmitter(1800000L);
        emitters.add(emitter);

        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> {
            emitter.complete();
            emitters.remove(emitter);
        });
        emitter.onError((e) -> {
            emitter.complete();
            emitters.remove(emitter);
        });

        // Send initial connected heartbeat
        try {
            emitter.send(SseEmitter.event()
                    .name("CONNECTED")
                    .data("{\"status\":\"CONNECTED\",\"message\":\"ModelDock telemetry stream online\"}"));
        } catch (IOException e) {
            emitters.remove(emitter);
        }

        return emitter;
    }

    public void broadcastEvent(LiveInferenceEvent event) {
        // 1. Broadcast via WebSocket STOMP broker
        try {
            messagingTemplate.convertAndSend("/topic/events", event);
        } catch (Exception e) {
            log.debug("WebSocket broadcast error: {}", e.getMessage());
        }

        // 2. Broadcast via Server-Sent Events (SSE)
        List<SseEmitter> deadEmitters = new CopyOnWriteArrayList<>();
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("INFERENCE_EVENT")
                        .data(event));
            } catch (Exception e) {
                deadEmitters.add(emitter);
            }
        }
        emitters.removeAll(deadEmitters);
    }
}
