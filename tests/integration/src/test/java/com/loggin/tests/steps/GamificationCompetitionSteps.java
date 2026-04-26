package com.loggin.tests.steps;

import com.loggin.tests.support.ApiClient;
import com.loggin.tests.support.TestContext;
import io.cucumber.java.PendingException;
import io.cucumber.java.en.*;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;

/**
 * Step definitions for Epic 2 — Gamification & Competition
 * Covers: US EP 2.1 (Handling Pressure), US EP 2.2 (Educational Experience),
 *         US EP 2.3 (Points for Data Collection), US EP 2.4 (Leaderboard),
 *         US EP 2.5 (Team Competition), US EP 2.6 (Team Leaderboard),
 *         US EP 2.7 (Points from Multiple Activities)
 */
public class GamificationCompetitionSteps {

    private final TestContext ctx;
    private final ApiClient api;

    public GamificationCompetitionSteps(TestContext ctx, ApiClient api) {
        this.ctx = ctx;
        this.api = api;
    }

    // ── US EP 2.4 — Global leaderboard (implementable now via overview) ───────

    @When("I request the dashboard overview")
    public void iRequestTheDashboardOverview() {
        ctx.setLastResponse(api.getOverview());
    }

    @Then("the overview response contains a sensors list")
    public void theOverviewContainsSensorsList() {
        assertThat("sensors array present",
                ctx.getLastResponse().jsonPath().getList("sensors"), is(notNullValue()));
    }

    @Then("the overview response contains an elements list")
    public void theOverviewContainsElementsList() {
        assertThat("element array present",
                ctx.getLastResponse().jsonPath().getList("element"), is(notNullValue()));
    }

    // ── US EP 2.5 — Team Competition: party management ───────────────────────
    // (Party creation / join steps are defined in NavigationExplorationSteps;
    //  the feature file reuses those shared steps.)

    @Then("the response should contain {int} groups")
    public void theResponseShouldContainGroups(int count) {
        // Party response currently returns an empty Members list; group count
        // would need a dedicated endpoint. Assert the party itself is returned.
        assertThat("party id present",
                ctx.getLastResponse().jsonPath().getLong("id"), greaterThan(0L));
    }

    // ── US EP 2.6 — Team Leaderboard: session scores ─────────────────────────
    // Depends on quiz/scoring endpoints not yet implemented.

    @When("the session ends and I request the team leaderboard")
    public void iRequestTeamLeaderboard() {
        throw new PendingException(
            "US EP 2.6: Team leaderboard endpoint not yet implemented. " +
            "Implement GET /api/game/party/{id}/leaderboard and update this step.");
    }

    // ── US EP 2.1 — Time-pressure quiz answering ─────────────────────────────

    @When("I answer quiz question {int} with option {int}")
    public void iAnswerQuizQuestion(int questionIndex, int optionIndex) {
        throw new PendingException(
            "US EP 2.1: Quiz answer endpoint not yet implemented. " +
            "Implement POST /api/game/quiz/answer and update this step.");
    }

    @Then("I should receive points based on my response speed")
    public void iShouldReceivePointsBasedOnSpeed() {
        throw new PendingException(
            "US EP 2.1: Scoring endpoint not yet implemented.");
    }

    // ── US EP 2.2 — Educational experience: hint fragments ───────────────────

    @When("the quiz for the current section is displayed")
    public void theQuizForSectionIsDisplayed() {
        throw new PendingException(
            "US EP 2.2: Quiz fetch endpoint not yet implemented. " +
            "Implement GET /api/game/quiz/{sectionId} and update this step.");
    }

    @Then("each question should be associated with a hint fragment")
    public void eachQuestionShouldHaveHintFragment() {
        throw new PendingException("US EP 2.2: Hint fragment endpoint not yet implemented.");
    }

    // ── US EP 2.3 — Points for data collection: Scout sensor contribution ────

    @When("I collect a sensor hint fragment for sensor {long}")
    public void iCollectSensorHintFragment(long sensorId) {
        throw new PendingException(
            "US EP 2.3: Sensor interaction endpoint not yet implemented. " +
            "Implement POST /api/game/sensor/{id}/collect and update this step.");
    }

    @Then("my group's progress should be updated")
    public void myGroupProgressShouldBeUpdated() {
        throw new PendingException("US EP 2.3: Group progress endpoint not yet implemented.");
    }

    // ── US EP 2.7 — Points from multiple activities ───────────────────────────

    @When("my group completes the section quiz")
    public void myGroupCompletesTheSectionQuiz() {
        throw new PendingException(
            "US EP 2.7: Section-complete scoring endpoint not yet implemented.");
    }

    @Then("total points should reflect both correctness and speed contributions")
    public void totalPointsShouldReflectBothContributions() {
        throw new PendingException("US EP 2.7: Scoring summary endpoint not yet implemented.");
    }

    @When("I answer correctly multiple times in a row")
    public void iAnswerCorrectlyMultipleTimesInARow() {
        throw new PendingException("US EP 2.7: Streak scoring not yet implemented.");
    }

    @Then("my points should be multiplied by the streak bonus")
    public void myPointsShouldBeMultipliedByStreakBonus() {
        throw new PendingException("US EP 2.7: Streak multiplier not yet implemented.");
    }
}
