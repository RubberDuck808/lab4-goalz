package com.loggin.tests.steps;

import com.loggin.tests.support.ApiClient;
import com.loggin.tests.support.TestContext;
import io.cucumber.java.PendingException;
import io.cucumber.java.en.*;
import io.restassured.response.Response;

import java.util.Arrays;
import java.util.List;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;

/**
 * Step definitions for Epic 3 — Sensor Integration
 * Covers: US EP 3.1 (Automatic Sensor Data Collection),
 *         US EP 3.2 (Sensor Detection),
 *         US EP 3.3 (Sensor Data Upload)
 */
public class SensorIntegrationSteps {

    private final TestContext ctx;
    private final ApiClient api;

    public SensorIntegrationSteps(TestContext ctx, ApiClient api) {
        this.ctx = ctx;
        this.api = api;
    }

    // ── US EP 3.3 — Sensor Data Upload: dashboard sensor CRUD ────────────────

    @When("I create a sensor named {string} at longitude {double} and latitude {double}")
    public void iCreateASensor(String name, double longitude, double latitude) {
        Response resp = api.createSensor("TEST_" + name, longitude, latitude);
        ctx.setLastResponse(resp);
        if (resp.getStatusCode() == 201) {
            long id = resp.jsonPath().getLong("id");
            ctx.setLastCreatedId(id);
            ctx.addCreatedSensorId(id);
        }
    }

    @Then("the response should contain the sensor ID")
    public void theResponseShouldContainSensorId() {
        long id = ctx.getLastResponse().jsonPath().getLong("id");
        assertThat("sensor id > 0", id, greaterThan(0L));
    }

    @Then("the response should contain sensor name {string}")
    public void theResponseShouldContainSensorName(String expectedName) {
        assertThat(ctx.getLastResponse().jsonPath().getString("sensorName"),
                   is("TEST_" + expectedName));
    }

    @When("I update the created sensor to name {string} at longitude {double} and latitude {double}")
    public void iUpdateCreatedSensor(String name, double longitude, double latitude) {
        ctx.setLastResponse(
                api.updateSensor(ctx.getLastCreatedId(), "TEST_" + name, longitude, latitude));
    }

    @When("I delete the created sensor")
    public void iDeleteTheCreatedSensor() {
        ctx.setLastResponse(api.deleteSensor(ctx.getLastCreatedId()));
    }

    @When("I delete sensor {long}")
    public void iDeleteSensor(long id) {
        ctx.setLastResponse(api.deleteSensor(id));
    }

    // ── US EP 3.3 — Dataset import ────────────────────────────────────────────

    @When("I upload a dataset with the following records:")
    public void iUploadDatasetWithRecords(List<String> records) {
        ctx.setLastResponse(api.storeDataset(records));
    }

    @Then("the response should confirm elements were stored successfully")
    public void theResponseShouldConfirmElementsStored() {
        assertThat(ctx.getLastResponse().getStatusCode(), is(200));
    }

    @When("I store dataset records from a raw CSV payload")
    public void iStoreDatasetRecordsFromCsvPayload() {
        List<String> sampleRecords = Arrays.asList(
                "Name;Type;Longitude;Latitude;IsGreen;ImageUrl",
                "TEST_Oak_Tree;Tree;16.370;48.208;true;",
                "TEST_Birch;Tree;16.372;48.210;true;"
        );
        ctx.setLastResponse(api.storeDataset(sampleRecords));
    }

    // ── US EP 3.1 — Automatic Sensor Data Collection ─────────────────────────
    // This user story requires a game-side sensor interaction endpoint.

    @When("a scout interacts with sensor {long} during an active session")
    public void scoutInteractsWithSensor(long sensorId) {
        throw new PendingException(
            "US EP 3.1: Sensor interaction endpoint not yet implemented. " +
            "Implement POST /api/game/session/sensor/{id}/interact and update this step.");
    }

    @Then("a hint fragment should be recorded automatically for the scout's group")
    public void hintFragmentShouldBeRecorded() {
        throw new PendingException("US EP 3.1: Hint fragment recording not yet implemented.");
    }

    @Then("the group progress counter should increment by one")
    public void groupProgressCounterShouldIncrement() {
        throw new PendingException("US EP 3.1: Group progress endpoint not yet implemented.");
    }

    // ── US EP 3.2 — Sensor Detection ─────────────────────────────────────────
    // Proximity detection (QR / NFC / BLE) is a mobile-app concern; the
    // API side would expose a nearby-sensors query endpoint.

    @When("I request sensors near longitude {double} and latitude {double} within {int} metres")
    public void iRequestNearbySensors(double lon, double lat, int radiusMetres) {
        throw new PendingException(
            "US EP 3.2: Nearby-sensor endpoint not yet implemented. " +
            "Implement GET /api/game/sensors/nearby?lon=&lat=&radius= and update this step.");
    }

    @Then("the response should list only sensors within range")
    public void responseShouldListOnlySensorsWithinRange() {
        throw new PendingException("US EP 3.2: Nearby-sensor filtering not yet implemented.");
    }
}
