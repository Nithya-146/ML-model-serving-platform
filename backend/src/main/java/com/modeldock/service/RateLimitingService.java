package com.modeldock.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitingService {

    private static final Logger log = LoggerFactory.getLogger(RateLimitingService.class);

    private final StringRedisTemplate redisTemplate;

    @Value("${modeldock.rate-limit.capacity:120}")
    private int capacity;

    @Value("${modeldock.rate-limit.refill-tokens-per-second:30}")
    private int refillTokensPerSecond;

    // In-memory fallback token bucket for resilient zero-dependency standalone execution
    private final Map<String, TokenBucket> localBuckets = new ConcurrentHashMap<>();

    public RateLimitingService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public boolean tryAcquire(String key) {
        // Try Redis first
        try {
            if (redisTemplate != null && redisTemplate.getConnectionFactory() != null) {
                String redisKey = "rate_limit:" + key;
                Long current = redisTemplate.opsForValue().increment(redisKey, 1);
                if (current != null && current == 1) {
                    redisTemplate.expire(redisKey, Duration.ofSeconds(1));
                }
                return current != null && current <= refillTokensPerSecond;
            }
        } catch (Exception e) {
            log.trace("Redis unavailable for rate limiting, falling back to in-memory bucket: {}", e.getMessage());
        }

        // Resilient in-memory token bucket fallback
        TokenBucket bucket = localBuckets.computeIfAbsent(key, k -> new TokenBucket(capacity, refillTokensPerSecond));
        return bucket.tryConsume(1);
    }

    private static class TokenBucket {
        private final double maxTokens;
        private final double refillRate;
        private double tokens;
        private long lastRefillTimestamp;

        public TokenBucket(double maxTokens, double refillRate) {
            this.maxTokens = maxTokens;
            this.refillRate = refillRate;
            this.tokens = maxTokens;
            this.lastRefillTimestamp = System.nanoTime();
        }

        public synchronized boolean tryConsume(int count) {
            refill();
            if (tokens >= count) {
                tokens -= count;
                return true;
            }
            return false;
        }

        private void refill() {
            long now = System.nanoTime();
            double secondsSinceLastRefill = (now - lastRefillTimestamp) / 1_000_000_000.0;
            tokens = Math.min(maxTokens, tokens + (secondsSinceLastRefill * refillRate));
            lastRefillTimestamp = now;
        }
    }
}
