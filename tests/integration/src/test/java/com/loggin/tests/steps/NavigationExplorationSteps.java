package com.loggin.tests.steps;

import com.loggin.tests.support.ApiClient;
import com.loggin.tests.support.TestContext;
import io.cucumber.java.en.*;
import io.restassured.response.Response;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;

/**
 * Step definitions for Epic 1 — Navigation & Exploration
 * Covers: US EP 1.1 (Achievement Metric / account + friends),
 *         US EP 1.2 (Route Navigation / party + lobby),
 *         US EP 1.3 (Landscape Photo Capture / elements as trailblazer targets)
 *
 * Common assertion steps (response status, token present) live here and are
 * reused by the other epic step files through PicoContainer's shared TestContext.
 */
public class NavigationExplorationSteps {

    private final TestContext ctx;
    private final ApiClient api;

    public NavigationExplorationSteps(TestContext ctx, ApiClient api) {
        this.ctx = ctx;
        this.api = api;
    }

    // ── Common reusable assertions ───────────────────────────────────────────

    @Then("the response status should be {int}")
    public void theResponseStatusShouldBe(int expectedStatus) {
        assertThat("HTTP status", ctx.getLastResponse().getStatusCode(), is(expectedStatus));
    }

    @Then("the response body should contain a field {string}")
    public void theResponseBodyShouldContainField(String field) {
        assertThat(ctx.getLastResponse().jsonPath().get(field), is(notNullValue()));
    }

    @Then("the response should be a JSON array")
    public void theResponseShouldBeAJsonArray() {
        assertThat(ctx.getLastResponse().jsonPath().getList("$"), is(notNullValue()));
    }

    // ── US EP 1.1 — Authentication (account prerequisite) ───────────────────

    @Given("the API is available")
    public void theApiIsAvailable() {
        // REST Assured will fail fast if the server is unreachable
    }

    @Given("I am logged in as {string}")
    public void iAmLoggedInAs(String usernameKey) {
        String email    = usernameKey.replace("test_", "") + "@goalz-test.internal";
        String password = usernameKey.equals("test_admin") ? "AdminPass123!" : "TestPass123!";
        Response resp = api.gameLogin(email, password);
        assertThat("Login status for " + usernameKey, resp.getStatusCode(), is(200));
        ctx.setAuthToken(resp.jsonPath().getString("token"));
    }

    @When("I sign up with username {string}, name {string}, email {string} and password {string}")
    public void iSignUp(String username, String name, String email, String password) {
        ctx.setLastResponse(api.gameSignUp(username, name, email, password));
    }

    @When("I log in with email {string} and password {string}")
    public void iLogIn(String email, String password) {
        Response resp = api.gameLogin(email, password);
        ctx.setLastResponse(resp);
        if (resp.getStatusCode() == 200) {
            ctx.setAuthToken(resp.jsonPath().getString("token"));
        }
    }

    @Then("the response should contain a JWT token")
    public void theResponseShouldContainAJwtToken() {
        String token = ctx.getLastResponse().jsonPath().getString("token");
        assertThat("token field", token, is(notNullValue()));
        assertThat("token not empty", token, not(emptyString()));
    }

    @Then("the response should contain username {string}")
    public void theResponseShouldContainUsername(String expected) {
        assertThat(ctx.getLastResponse().jsonPath().getString("username"), is(expected));
    }

    // ── US EP 1.1 — Friends (social achievement tracking) ───────────────────

    @When("I search for users matching {string}")
    public void iSearchForUsersMatching(String query) {
        ctx.setLastResponse(api.searchUsers(query));
    }

    @Then("the response should contain at least one user with username {string}")
    public void theResponseShouldContainUser(String username) {
        assertThat(ctx.getLastResponse().jsonPath()
                      .getList("findAll { it.username == '" + username + "' }"),
                   hasSize(greaterThanOrEqualTo(1)));
    }

    @When("I view public connections for {string}")
    public void iViewPublicConnections(String username) {
        ctx.setLastResponse(api.getConnections(username));
    }

    @When("I view my incoming friend requests")
    public void iViewMyIncomingFriendRequests() {
        ctx.setLastResponse(api.getRequests());
    }

    @When("I send a friend request to {string}")
    public void iSendFriendRequestTo(String targetUsername) {
        ctx.setLastResponse(api.sendFriendRequest(targetUsername));
    }

    @Given("I have already sent a friend request to {string}")
    public void iHaveAlreadySentFriendRequestTo(String targetUsername) {
        // Setup step — fire and forget, don't assert status here
        api.sendFriendRequest(targetUsername);
    }

    @When("I accept the friend request from {string}")
    public void iAcceptFriendRequestFrom(String requesterUsername) {
        ctx.setLastResponse(api.acceptFriendRequest(requesterUsername));
    }

    @When("I decline the friend request from {string}")
    public void iDeclineFriendRequestFrom(String requesterUsername) {
        ctx.setLastResponse(api.declineFriendRequest(requesterUsername));
    }

    @When("I remove the connection with {string}")
    public void iRemoveConnectionWith(String targetUsername) {
        ctx.setLastResponse(api.removeConnection(targetUsername));
    }

    @Given("{string} has sent me a friend request")
    public void hassentMeAFriendRequest(String senderKey) {
        // Log in as sender, send request to current user's token, then restore
        String senderEmail    = senderKey.replace("test_", "") + "@goalz-test.internal";
        String senderPassword = "TestPass123!";
        Response loginResp = api.gameLogin(senderEmail, senderPassword);
        String savedToken = ctx.getAuthToken();
        ctx.setAuthToken(loginResp.jsonPath().getString("token"));
        // Determine the current user's username from bag (set by "I am logged in as")
        String currentUsername = ctx.get("currentUsername");
        api.sendFriendRequest(currentUsername);
        ctx.setAuthToken(savedToken); // restore original token
    }

    // ── US EP 1.2 — Party / Route Navigation ────────────────────────────────

    @When("I create a party named {string}")
    public void iCreateAPartyNamed(String partyName) {
        ctx.setLastResponse(api.createParty("TEST_" + partyName, "test_alice"));
        if (ctx.getLastResponse().getStatusCode() == 200) {
            ctx.setLastCreatedId(ctx.getLastResponse().jsonPath().getLong("id"));
            ctx.put("partyCode", ctx.getLastResponse().jsonPath().getLong("code"));
        }
    }

    @When("I retrieve party with ID {long}")
    public void iRetrievePartyWithId(long id) {
        ctx.setLastResponse(api.getParty(id));
    }

    @When("I retrieve the created party")
    public void iRetrieveTheCreatedParty() {
        ctx.setLastResponse(api.getParty(ctx.getLastCreatedId()));
    }

    @Then("the response should contain party code between 100000 and 999999")
    public void theResponseShouldContainPartyCode() {
        long code = ctx.getLastResponse().jsonPath().getLong("code");
        assertThat("party code lower bound", code, greaterThanOrEqualTo(100000L));
        assertThat("party code upper bound", code, lessThanOrEqualTo(999999L));
    }

    @When("I join party with code {long}")
    public void iJoinPartyWithCode(long code) {
        ctx.setLastResponse(api.joinParty(code));
    }

    @When("I join the seeded party")
    public void iJoinTheSeededParty() {
        ctx.setLastResponse(api.joinParty(654321L));
    }

    @When("I attempt to join party with code {long} without authentication")
    public void iAttemptToJoinPartyWithoutAuth(long code) {
        ctx.clearAuthToken();
        ctx.setLastResponse(api.joinParty(code));
    }

    @When("I view the lobby for party {long}")
    public void iViewLobbyForParty(long partyId) {
        ctx.setLastResponse(api.getLobby(partyId));
    }

    // ── US EP 1.3 — Trailblazer: nature elements ────────────────────────────

    @When("I create an element named {string} of type {string} at {double}, {double}")
    public void iCreateAnElement(String name, String type, double lon, double lat) {
        Response resp = api.createElement("TEST_" + name, type, lon, lat, true);
        ctx.setLastResponse(resp);
        if (resp.getStatusCode() == 201) {
            long id = resp.jsonPath().getLong("id");
            ctx.setLastCreatedId(id);
            ctx.addCreatedElementId(id);
        }
    }

    @When("I update the created element to name {string} and type {string}")
    public void iUpdateCreatedElement(String name, String type) {
        ctx.setLastResponse(api.updateElement(
                ctx.getLastCreatedId(), "TEST_" + name, type, 16.0, 48.0, false));
    }

    @When("I delete the created element")
    public void iDeleteTheCreatedElement() {
        ctx.setLastResponse(api.deleteElement(ctx.getLastCreatedId()));
    }

    @When("I delete element {long}")
    public void iDeleteElement(long id) {
        ctx.setLastResponse(api.deleteElement(id));
    }

    @When("I retrieve all element types")
    public void iRetrieveAllElementTypes() {
        ctx.setLastResponse(api.getElementTypes());
    }

    // ── Dashboard auth (staff needs to manage zones / elements) ─────────────

    @When("I log into the dashboard with email {string} and password {string}")
    public void iLogIntoDashboard(String email, String password) {
        ctx.setLastResponse(api.dashboardLogin(email, password));
    }

    @When("admin {string} creates a staff account for {string} with email {string} and password {string}")
    public void adminCreatesStaffAccount(String adminEmail, String staffName, String staffEmail, String password) {
        ctx.setLastResponse(api.createStaffUser(adminEmail, staffEmail, staffName, password));
    }

    // ── Zones (map context for route navigation) ─────────────────────────────

    @When("I create a zone named {string} with type {string}")
    public void iCreateAZone(String name, String zoneType) {
        ctx.setLastResponse(api.createZone("TEST_" + name, zoneType, "#33A661", ApiClient.testPolygonBoundary()));
    }

    @When("I retrieve all zones")
    public void iRetrieveAllZones() {
        ctx.setLastResponse(api.getAllZones());
    }

    @Given("a zone named {string} of type {string} exists")
    public void aZoneExists(String name, String zoneType) {
        api.createZone(name, zoneType, "#33A661", ApiClient.testPolygonBoundary());
    }

    @When("I update the zone named {string} to name {string} and type {string}")
    public void iUpdateZoneNamedTo(String oldName, String newName, String newType) {
        long id = api.getAllZones().jsonPath()
                     .getLong("find { it.name == '" + oldName + "' }.id");
        ctx.setLastResponse(api.updateZone(id, newName, newType, "#33A661"));
    }

    @When("I delete the zone named {string}")
    public void iDeleteZoneNamed(String name) {
        long id = api.getAllZones().jsonPath()
                     .getLong("find { it.name == '" + name + "' }.id");
        ctx.setLastResponse(api.deleteZone(id));
    }

    @Then("the response should contain a zone named {string}")
    public void theResponseShouldContainZoneNamed(String name) {
        assertThat(ctx.getLastResponse().jsonPath()
                      .getList("findAll { it.name == '" + name + "' }"),
                   hasSize(greaterThanOrEqualTo(1)));
    }
}
