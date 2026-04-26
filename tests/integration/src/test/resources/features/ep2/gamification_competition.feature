# Story: US EP 2.1 - Handling Pressure
# Story: US EP 2.2 - Educational Experience
# Story: US EP 2.3 - Points for Data Collection
# Story: US EP 2.4 - Leaderboard
# Story: US EP 2.5 - Team Competition
# Story: US EP 2.6 - Team Leaderboard
# Story: US EP 2.7 - Points from Multiple Activities

@api @regression
Feature: EP2 — Gamification & Competition
  As a player I want to answer quizzes, earn points, collect sensor hints,
  and see rankings so that my group is motivated to perform better than others.

  Background:
    Given the API is available

  # ─────────────────────────────────────────────────────────────────────────────
  # US EP 2.4 — Leaderboard: dashboard overview (implementable now)
  # ─────────────────────────────────────────────────────────────────────────────

  @smoke @Priority:High
  Scenario: Dashboard overview returns sensors and elements lists
    When  I request the dashboard overview
    Then  the response status should be 200
    And   the overview response contains a sensors list
    And   the overview response contains an elements list

  # ─────────────────────────────────────────────────────────────────────────────
  # US EP 2.5 — Team Competition: party with groups
  # ─────────────────────────────────────────────────────────────────────────────

  @smoke @Priority:High
  Scenario: Creating a party returns an ID and generates four groups
    When  I create a party named "Competition Game"
    Then  the response status should be 200
    And   the response should contain party code between 100000 and 999999
    And   the response should contain 4 groups

  # ─────────────────────────────────────────────────────────────────────────────
  # US EP 2.1 — Handling Pressure: time-pressured quiz answers
  # ─────────────────────────────────────────────────────────────────────────────

  @smoke @Priority:High @WIP
  Scenario: Player answers a quiz question within the time limit
    Given I am logged in as "test_alice"
    When  I answer quiz question 1 with option 2
    Then  the response status should be 200
    And   I should receive points based on my response speed

  # ─────────────────────────────────────────────────────────────────────────────
  # US EP 2.2 — Educational Experience: hint fragments with quiz questions
  # ─────────────────────────────────────────────────────────────────────────────

  @regression @Priority:Medium @WIP
  Scenario: Quiz section displays questions each linked to a hint fragment
    Given I am logged in as "test_alice"
    When  the quiz for the current section is displayed
    Then  the response status should be 200
    And   each question should be associated with a hint fragment

  # ─────────────────────────────────────────────────────────────────────────────
  # US EP 2.3 — Points for Data Collection: scout sensor contribution
  # ─────────────────────────────────────────────────────────────────────────────

  @regression @Priority:Medium @WIP
  Scenario: Scout collects a sensor hint fragment and earns points
    Given I am logged in as "test_alice"
    When  I collect a sensor hint fragment for sensor 1
    Then  the response status should be 200
    And   my group's progress should be updated

  # ─────────────────────────────────────────────────────────────────────────────
  # US EP 2.6 — Team Leaderboard: session-level group rankings
  # ─────────────────────────────────────────────────────────────────────────────

  @smoke @Priority:High @WIP
  Scenario: Team leaderboard is available after session ends
    Given I am logged in as "test_alice"
    When  the session ends and I request the team leaderboard
    Then  the response status should be 200
    And   the response should be a JSON array

  # ─────────────────────────────────────────────────────────────────────────────
  # US EP 2.7 — Points from Multiple Activities: quiz correctness + speed
  # ─────────────────────────────────────────────────────────────────────────────

  @regression @Priority:Medium @WIP
  Scenario: Group score reflects both quiz correctness and answer speed
    Given I am logged in as "test_alice"
    When  my group completes the section quiz
    Then  total points should reflect both correctness and speed contributions

  @regression @Priority:Low @WIP
  Scenario: Player earns a streak bonus for consecutive correct answers
    Given I am logged in as "test_alice"
    When  I answer correctly multiple times in a row
    Then  my points should be multiplied by the streak bonus
