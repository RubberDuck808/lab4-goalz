package com.loggin.tests.support;

import io.github.cdimascio.dotenv.Dotenv;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;

import java.io.File;
import java.util.*;

import static io.restassured.RestAssured.given;

/**
 * Wraps every HTTP call to the Goalz API.
 * PicoContainer injects one instance per scenario via TestContext.
 */
public class ApiClient {

    private static final Dotenv DOTENV = Dotenv.configure()
            .filename(".env.test")
            .ignoreIfMissing()
            .load();

    private final String baseUrl;
    private final TestContext ctx;

    public ApiClient(TestContext ctx) {
        this.ctx = ctx;
        this.baseUrl = env("TEST_API_URL", "http://localhost:5143");
        RestAssured.enableLoggingOfRequestAndResponseIfValidationFails();
    }

    // ── Internal helpers ─────────────────────────────────────────────────────

    static String env(String key, String fallback) {
        String v = System.getenv(key);
        if (v != null && !v.isBlank()) return v;
        String d = DOTENV.get(key, null);
        return d != null ? d : fallback;
    }

    /** Builds a LinkedHashMap from alternating key/value pairs. */
    private static Map<String, Object> body(Object... kv) {
        Map<String, Object> m = new LinkedHashMap<>();
        for (int i = 0; i < kv.length; i += 2) m.put((String) kv[i], kv[i + 1]);
        return m;
    }

    private RequestSpecification base() {
        return given()
                .baseUri(baseUrl)
                .contentType(ContentType.JSON)
                .accept(ContentType.JSON);
    }

    private RequestSpecification authed() {
        return base().header("Authorization", "Bearer " + ctx.getAuthToken());
    }

    // ── GeoJSON helpers ──────────────────────────────────────────────────────

    /** Returns a GeoJSON Polygon suitable for zone boundary fields. */
    public static Map<String, Object> testPolygonBoundary() {
        List<List<List<Double>>> coords = Collections.singletonList(Arrays.asList(
                Arrays.asList(16.0, 48.0),
                Arrays.asList(17.0, 48.0),
                Arrays.asList(17.0, 49.0),
                Arrays.asList(16.0, 49.0),
                Arrays.asList(16.0, 48.0)
        ));
        return body("type", "Polygon", "coordinates", coords);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Game — Authentication  (EP 1.1, EP 1.2)
    // ═══════════════════════════════════════════════════════════════════════════

    /** POST /api/game/auth/login */
    public Response gameLogin(String email, String password) {
        return base()
                .body(body("email", email, "password", password))
                .post("/api/game/auth/login");
    }

    /** POST /api/game/auth/signup */
    public Response gameSignUp(String username, String name, String email, String password) {
        return base()
                .body(body("username", username, "name", name, "email", email, "password", password))
                .post("/api/game/auth/signup");
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Game — Party  (EP 1.2, EP 2.5, EP 2.6)
    // ═══════════════════════════════════════════════════════════════════════════

    /** POST /api/game/party/create */
    public Response createParty(String name, String username) {
        return base()
                .body(body("name", name, "username", username))
                .post("/api/game/party/create");
    }

    /** GET /api/game/party/{id} */
    public Response getParty(long id) {
        return base().get("/api/game/party/{id}", id);
    }

    /** POST /api/game/party/join  — requires JWT */
    public Response joinParty(long code) {
        return authed()
                .body(body("code", code))
                .post("/api/game/party/join");
    }

    /** GET /api/game/party/{partyId}/lobby  — requires JWT */
    public Response getLobby(long partyId) {
        return authed().get("/api/game/party/{partyId}/lobby", partyId);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Game — Friends / Social  (EP 1.1)
    // ═══════════════════════════════════════════════════════════════════════════

    /** GET /api/game/friends/search?q=  — requires JWT */
    public Response searchUsers(String query) {
        return authed().queryParam("q", query).get("/api/game/friends/search");
    }

    /** GET /api/game/friends/connections/{username}  — public */
    public Response getConnections(String username) {
        return base().get("/api/game/friends/connections/{username}", username);
    }

    /** GET /api/game/friends/requests  — requires JWT */
    public Response getRequests() {
        return authed().get("/api/game/friends/requests");
    }

    /** POST /api/game/friends/request  — requires JWT */
    public Response sendFriendRequest(String targetUsername) {
        return authed()
                .body(body("username", targetUsername))
                .post("/api/game/friends/request");
    }

    /** PUT /api/game/friends/accept  — requires JWT */
    public Response acceptFriendRequest(String requesterUsername) {
        return authed()
                .body(body("username", requesterUsername))
                .put("/api/game/friends/accept");
    }

    /** DELETE /api/game/friends/decline  — requires JWT */
    public Response declineFriendRequest(String requesterUsername) {
        return authed()
                .body(body("username", requesterUsername))
                .delete("/api/game/friends/decline");
    }

    /** DELETE /api/game/friends/connection  — requires JWT */
    public Response removeConnection(String targetUsername) {
        return authed()
                .body(body("username", targetUsername))
                .delete("/api/game/friends/connection");
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Dashboard — Authentication
    // ═══════════════════════════════════════════════════════════════════════════

    /** POST /api/dashboard/auth/login */
    public Response dashboardLogin(String email, String password) {
        return base()
                .body(body("email", email, "password", password))
                .post("/api/dashboard/auth/login");
    }

    /** POST /api/dashboard/auth/create-user */
    public Response createStaffUser(String adminEmail, String email, String name, String password) {
        return base()
                .body(body("adminEmail", adminEmail, "email", email, "name", name, "password", password))
                .post("/api/dashboard/auth/create-user");
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Dashboard — Overview  (EP 2.4)
    // ═══════════════════════════════════════════════════════════════════════════

    /** GET /api/dashboard/overview */
    public Response getOverview() {
        return base().get("/api/dashboard/overview");
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Dashboard — Zones  (EP 1.2 map context)
    // ═══════════════════════════════════════════════════════════════════════════

    /** GET /api/dashboard/zones */
    public Response getAllZones() {
        return base().get("/api/dashboard/zones");
    }

    /** POST /api/dashboard/zones */
    public Response createZone(String name, String zoneType, String color, Map<String, Object> boundary) {
        return base()
                .body(body("name", name, "zoneType", zoneType, "color", color, "boundary", boundary))
                .post("/api/dashboard/zones");
    }

    /** PUT /api/dashboard/zones/{id} */
    public Response updateZone(long id, String name, String zoneType, String color) {
        return base()
                .body(body("name", name, "zoneType", zoneType, "color", color))
                .put("/api/dashboard/zones/{id}", id);
    }

    /** DELETE /api/dashboard/zones/{id} */
    public Response deleteZone(long id) {
        return base().delete("/api/dashboard/zones/{id}", id);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Dashboard — Sensors  (EP 3.1, EP 3.3)
    // ═══════════════════════════════════════════════════════════════════════════

    /** POST /api/dashboard/sensors */
    public Response createSensor(String sensorName, double longitude, double latitude) {
        return base()
                .body(body("sensorName", sensorName, "longitude", longitude, "latitude", latitude))
                .post("/api/dashboard/sensors");
    }

    /** PUT /api/dashboard/sensors/{id} */
    public Response updateSensor(long id, String sensorName, double longitude, double latitude) {
        return base()
                .body(body("sensorName", sensorName, "longitude", longitude, "latitude", latitude))
                .put("/api/dashboard/sensors/{id}", id);
    }

    /** DELETE /api/dashboard/sensors/{id} */
    public Response deleteSensor(long id) {
        return base().delete("/api/dashboard/sensors/{id}", id);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Dashboard — Elements / Nature Elements  (EP 1.3 Trailblazer targets)
    // ═══════════════════════════════════════════════════════════════════════════

    /** GET /api/dashboard/elements/types */
    public Response getElementTypes() {
        return base().get("/api/dashboard/elements/types");
    }

    /** POST /api/dashboard/elements */
    public Response createElement(String elementName, String elementType,
                                   double longitude, double latitude, boolean isGreen) {
        return base()
                .body(body("elementName", elementName, "elementType", elementType,
                           "longitude", longitude, "latitude", latitude, "isGreen", isGreen))
                .post("/api/dashboard/elements");
    }

    /** PUT /api/dashboard/elements/{id} */
    public Response updateElement(long id, String elementName, String elementType,
                                   double longitude, double latitude, boolean isGreen) {
        return base()
                .body(body("elementName", elementName, "elementType", elementType,
                           "longitude", longitude, "latitude", latitude, "isGreen", isGreen))
                .put("/api/dashboard/elements/{id}", id);
    }

    /** DELETE /api/dashboard/elements/{id} */
    public Response deleteElement(long id) {
        return base().delete("/api/dashboard/elements/{id}", id);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Dashboard — Dataset Import  (EP 3.3 sensor data upload)
    // ═══════════════════════════════════════════════════════════════════════════

    /** POST /api/dashboard/ImportDataset  (multipart) */
    public Response uploadDataset(File csvFile) {
        return given()
                .baseUri(baseUrl)
                .contentType("multipart/form-data")
                .multiPart("files", csvFile, "text/csv")
                .post("/api/dashboard/ImportDataset");
    }

    /** POST /api/dashboard/ImportDataset/store */
    public Response storeDataset(List<String> records) {
        return base().body(records).post("/api/dashboard/ImportDataset/store");
    }
}
