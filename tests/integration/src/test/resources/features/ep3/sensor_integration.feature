# Story: US EP 3.1 - Automatic Sensor Data Collection
# Story: US EP 3.2 - Sensor Detection
# Story: US EP 3.3 - Sensor Data Upload

@api @regression
Feature: EP3 — Sensor Integration
  As a Scout I want the app to detect nearby sensors, automatically record
  hint fragments, and upload interaction data so that my group's progress
  is updated in real time.

  Background:
    Given the API is available

  # ─────────────────────────────────────────────────────────────────────────────
  # US EP 3.3 — Sensor Data Upload: dashboard sensor CRUD
  # ─────────────────────────────────────────────────────────────────────────────

  @smoke @Priority:High
  Scenario: Staff creates a new sensor at a map location
    When  I create a sensor named "Entrance Gate" at longitude 16.37 and latitude 48.21
    Then  the response status should be 201
    And   the response should contain the sensor ID
    And   the response should contain sensor name "Entrance Gate"

  @regression @Priority:Medium
  Scenario: Staff updates an existing sensor's name and position
    Given I create a sensor named "Temp Sensor" at longitude 16.0 and latitude 48.0
    When  I update the created sensor to name "Updated Sensor" at longitude 16.5 and latitude 48.5
    Then  the response status should be 204

  @regression @Priority:Medium
  Scenario: Staff deletes a sensor
    Given I create a sensor named "Delete Me" at longitude 16.1 and latitude 48.1
    When  I delete the created sensor
    Then  the response status should be 204

  @regression @Priority:Low
  Scenario: Deleting a non-existent sensor returns not found
    When  I delete sensor 999999999
    Then  the response status should be 404

  # ─────────────────────────────────────────────────────────────────────────────
  # US EP 3.3 — Sensor Data Upload: bulk dataset import
  # ─────────────────────────────────────────────────────────────────────────────

  @smoke @Priority:High
  Scenario: Staff stores a structured dataset of nature elements
    When  I upload a dataset with the following records:
      | Name;Type;Longitude;Latitude;IsGreen;ImageUrl       |
      | TEST_Oak_Tree;Tree;16.370;48.208;true;               |
      | TEST_Birch;Tree;16.372;48.210;true;                  |
    Then  the response status should be 200
    And   the response should confirm elements were stored successfully

  @regression @Priority:Medium
  Scenario: Staff stores a raw CSV payload via the store endpoint
    When  I store dataset records from a raw CSV payload
    Then  the response status should be 200
    And   the response should confirm elements were stored successfully

  # ─────────────────────────────────────────────────────────────────────────────
  # US EP 3.1 — Automatic Sensor Data Collection
  # ─────────────────────────────────────────────────────────────────────────────

  @smoke @Priority:High @WIP
  Scenario: Scout interacts with a sensor and a hint fragment is recorded
    Given I am logged in as "test_alice"
    When  a scout interacts with sensor 1 during an active session
    Then  a hint fragment should be recorded automatically for the scout's group
    And   the group progress counter should increment by one

  # ─────────────────────────────────────────────────────────────────────────────
  # US EP 3.2 — Sensor Detection: proximity query
  # ─────────────────────────────────────────────────────────────────────────────

  @smoke @Priority:High @WIP
  Scenario: App retrieves sensors within a given radius of the player's location
    When  I request sensors near longitude 16.37 and latitude 48.21 within 100 metres
    Then  the response status should be 200
    And   the response should list only sensors within range
