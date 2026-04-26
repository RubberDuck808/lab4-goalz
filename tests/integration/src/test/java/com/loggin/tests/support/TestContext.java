package com.loggin.tests.support;

import io.restassured.response.Response;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Per-scenario shared state.  PicoContainer injects one instance into every
 * step class and TestHooks so all collaborators see the same token, response,
 * and seeded IDs.
 */
public class TestContext {

    // ── Auth ─────────────────────────────────────────────────────────────────
    private String authToken = "";

    public String getAuthToken() { return authToken; }
    public void setAuthToken(String token) { this.authToken = token; }
    public void clearAuthToken() { this.authToken = ""; }

    // ── Last HTTP response ───────────────────────────────────────────────────
    private Response lastResponse;

    public Response getLastResponse() { return lastResponse; }
    public void setLastResponse(Response r) { this.lastResponse = r; }

    // ── Last created entity (for update / delete chaining) ───────────────────
    private long lastCreatedId = -1;

    public long getLastCreatedId() { return lastCreatedId; }
    public void setLastCreatedId(long id) { this.lastCreatedId = id; }

    // ── IDs of entities seeded in @Before (used by @After for cleanup) ───────
    private long seededQuizId = -1;
    private long seededPartyId = -1;
    private final Map<String, Long> seededUserIds = new HashMap<>();

    public long getSeededQuizId() { return seededQuizId; }
    public void setSeededQuizId(long id) { this.seededQuizId = id; }

    public long getSeededPartyId() { return seededPartyId; }
    public void setSeededPartyId(long id) { this.seededPartyId = id; }

    public void putSeededUserId(String key, long id) { seededUserIds.put(key, id); }
    public long getSeededUserId(String key) { return seededUserIds.getOrDefault(key, -1L); }

    // ── IDs created during scenarios (cleaned up in @After) ─────────────────
    private final List<Long> createdSensorIds = new ArrayList<>();
    private final List<Long> createdElementIds = new ArrayList<>();

    public void addCreatedSensorId(long id) { createdSensorIds.add(id); }
    public List<Long> getCreatedSensorIds() { return createdSensorIds; }

    public void addCreatedElementId(long id) { createdElementIds.add(id); }
    public List<Long> getCreatedElementIds() { return createdElementIds; }

    // ── Arbitrary scenario data (step-to-step passing) ───────────────────────
    private final Map<String, Object> bag = new HashMap<>();

    public void put(String key, Object value) { bag.put(key, value); }
    @SuppressWarnings("unchecked")
    public <T> T get(String key) { return (T) bag.get(key); }
    public boolean has(String key) { return bag.containsKey(key); }
}
