# Story: US EP 1.1 - Achievement Metric
# Story: US EP 1.2 - Route Navigation
# Story: US EP 1.3 - Landscape Photo Capture

@api @regression
Feature: EP1 — Navigation & Exploration
  As a player I want to authenticate, navigate routes, and photograph
  nature elements so that I can track achievements and help my group
  reveal the box location on the map.

  Background:
    Given the API is available

  # ─────────────────────────────────────────────────────────────────────────────
  # US EP 1.1 — Achievement Metric: account creation and login
  # ─────────────────────────────────────────────────────────────────────────────

  @smoke @Priority:High
  Scenario: New player signs up with valid credentials
    When I sign up with username "ep1_newplayer", name "New Player", email "ep1_newplayer@goalz-test.internal" and password "TestPass123!"
    Then the response status should be 201
    And  the response should contain a JWT token
    And  the response should contain username "ep1_newplayer"

  @smoke @Priority:High
  Scenario: Returning player logs in successfully
    When I log in with email "alice@goalz-test.internal" and password "TestPass123!"
    Then the response status should be 200
    And  the response should contain a JWT token
    And  the response should contain username "test_alice"

  @regression @Priority:High
  Scenario: Login fails with incorrect password
    When I log in with email "alice@goalz-test.internal" and password "WrongPassword!"
    Then the response status should be 401

  @regression @Priority:Medium
  Scenario: Login fails for an unknown email address
    When I log in with email "ghost_nobody@goalz-test.internal" and password "any"
    Then the response status should be 401

  @regression @Priority:Medium
  Scenario: Signup fails when email is already registered
    When I sign up with username "ep1_dup1", name "Dup", email "alice@goalz-test.internal" and password "TestPass123!"
    Then the response status should be 409

  @regression @Priority:Medium
  Scenario: Signup fails when username is already taken
    When I sign up with username "test_alice", name "Alice2", email "ep1_alice2@goalz-test.internal" and password "TestPass123!"
    Then the response status should be 409

  # ─────────────────────────────────────────────────────────────────────────────
  # US EP 1.1 — Achievement Metric: friends for social progress tracking
  # ─────────────────────────────────────────────────────────────────────────────

  @smoke @Priority:Medium
  Scenario: Player searches for another user by username
    Given I am logged in as "test_alice"
    When  I search for users matching "test_bob"
    Then  the response status should be 200
    And   the response should be a JSON array
    And   the response should contain at least one user with username "test_bob"

  @regression @Priority:Low
  Scenario: Search with a query shorter than 2 characters returns empty results
    Given I am logged in as "test_alice"
    When  I search for users matching "t"
    Then  the response status should be 200
    And   the response should be a JSON array

  @regression @Priority:Medium
  Scenario: Player views another user's public connections
    When  I view public connections for "test_alice"
    Then  the response status should be 200
    And   the response should be a JSON array

  @smoke @Priority:Medium
  Scenario: Player sends a friend request to another player
    Given I am logged in as "test_alice"
    When  I send a friend request to "test_bob"
    Then  the response status should be 204

  @regression @Priority:Medium
  Scenario: Player cannot send a friend request to themselves
    Given I am logged in as "test_alice"
    When  I send a friend request to "test_alice"
    Then  the response status should be 400

  @regression @Priority:Medium
  Scenario: Sending a duplicate friend request returns conflict
    Given I am logged in as "test_alice"
    And   I have already sent a friend request to "test_bob"
    When  I send a friend request to "test_bob"
    Then  the response status should be 409

  @smoke @Priority:Medium
  Scenario: Player accepts an incoming friend request
    Given I am logged in as "test_bob"
    And   I have already sent a friend request to "test_alice"
    Given I am logged in as "test_alice"
    When  I accept the friend request from "test_bob"
    Then  the response status should be 204

  @regression @Priority:Medium
  Scenario: Accepting a non-existent request returns not found
    Given I am logged in as "test_alice"
    When  I accept the friend request from "test_bob"
    Then  the response status should be 404

  @regression @Priority:Medium
  Scenario: Player declines an incoming friend request
    Given I am logged in as "test_bob"
    And   I have already sent a friend request to "test_alice"
    Given I am logged in as "test_alice"
    When  I decline the friend request from "test_bob"
    Then  the response status should be 204

  @regression @Priority:Medium
  Scenario: Player views their incoming friend requests
    Given I am logged in as "test_bob"
    And   I have already sent a friend request to "test_alice"
    Given I am logged in as "test_alice"
    When  I view my incoming friend requests
    Then  the response status should be 200
    And   the response should be a JSON array

  @smoke @Priority:Medium
  Scenario: Player removes an existing connection
    Given I am logged in as "test_bob"
    And   I have already sent a friend request to "test_alice"
    Given I am logged in as "test_alice"
    And   I accept the friend request from "test_bob"
    Given I am logged in as "test_alice"
    When  I remove the connection with "test_bob"
    Then  the response status should be 204

  @regression @Priority:Low
  Scenario: Removing a non-existent connection returns not found
    Given I am logged in as "test_alice"
    When  I remove the connection with "test_bob"
    Then  the response status should be 404

  # ─────────────────────────────────────────────────────────────────────────────
  # US EP 1.2 — Route Navigation: party management
  # ─────────────────────────────────────────────────────────────────────────────

  @smoke @Priority:High
  Scenario: Party owner creates a new party
    When  I create a party named "Biology Class"
    Then  the response status should be 200
    And   the response should contain party code between 100000 and 999999

  @smoke @Priority:High
  Scenario: Player retrieves party details by ID
    When  I create a party named "Retrieve Test"
    And   I retrieve the created party
    Then  the response status should be 200
    And   the response body should contain a field "name"
    And   the response body should contain a field "code"

  @smoke @Priority:High
  Scenario: Authenticated player joins a party using the seeded code 654321
    Given I am logged in as "test_alice"
    When  I join the seeded party
    Then  the response status should be 200
    And   the response body should contain a field "id"

  @regression @Priority:High
  Scenario: Joining a party with an invalid code returns not found
    Given I am logged in as "test_alice"
    When  I join party with code 999999999
    Then  the response status should be 404

  @regression @Priority:High
  Scenario: Joining a party without authentication is rejected
    When  I attempt to join party with code 654321 without authentication
    Then  the response status should be 401

  @smoke @Priority:Medium @WIP
  Scenario: Player views the live lobby after joining
    Given I am logged in as "test_alice"
    When  I view the lobby for party 1
    Then  the response status should be 200

  # ─────────────────────────────────────────────────────────────────────────────
  # US EP 1.3 — Landscape Photo Capture: nature elements as trailblazer targets
  # ─────────────────────────────────────────────────────────────────────────────

  @smoke @Priority:High
  Scenario: Staff retrieves all available element types
    When  I retrieve all element types
    Then  the response status should be 200
    And   the response should be a JSON array

  @smoke @Priority:High
  Scenario: Staff creates a nature element as a trailblazer target
    When  I create an element named "Ancient Oak" of type "Tree" at 16.37, 48.21
    Then  the response status should be 201
    And   the response should contain the sensor ID

  @regression @Priority:Medium
  Scenario: Staff updates a trailblazer target element
    Given I create an element named "Update Me" of type "Tree" at 16.0, 48.0
    When  I update the created element to name "Updated Oak" and type "Tree"
    Then  the response status should be 204

  @regression @Priority:Medium
  Scenario: Staff deletes a trailblazer target element
    Given I create an element named "Delete Me" of type "Shrub" at 16.1, 48.1
    When  I delete the created element
    Then  the response status should be 204

  @regression @Priority:Low
  Scenario: Deleting a non-existent element returns not found
    When  I delete element 999999999
    Then  the response status should be 404

  # ─────────────────────────────────────────────────────────────────────────────
  # Dashboard auth + zone management (staff infrastructure for EP 1.2 / EP 1.3)
  # ─────────────────────────────────────────────────────────────────────────────

  @smoke @Priority:High
  Scenario: Staff member logs into the dashboard with valid credentials
    When  I log into the dashboard with email "admin@goalz-test.internal" and password "AdminPass123!"
    Then  the response status should be 200
    And   the response body should contain a field "email"
    And   the response body should contain a field "role"

  @regression @Priority:High
  Scenario: Dashboard login fails with wrong password
    When  I log into the dashboard with email "admin@goalz-test.internal" and password "WrongPass"
    Then  the response status should be 404

  @regression @Priority:High
  Scenario: Admin creates a new staff user account
    When  admin "admin@goalz-test.internal" creates a staff account for "New Staff" with email "ep1_newstaff@goalz-test.internal" and password "StaffPass123!"
    Then  the response status should be 201

  @regression @Priority:Medium
  Scenario: Non-admin cannot create a staff user account
    When  admin "alice@goalz-test.internal" creates a staff account for "Hacker" with email "ep1_hacker@goalz-test.internal" and password "HackPass123!"
    Then  the response status should be 401

  @regression @Priority:Medium
  Scenario: Creating a staff account fails when email is already taken
    When  admin "admin@goalz-test.internal" creates a staff account for "Dup Staff" with email "alice@goalz-test.internal" and password "StaffPass123!"
    Then  the response status should be 409

  @smoke @Priority:High
  Scenario: Staff creates a zone for the arboretum map
    When  I create a zone named "Forest Path" with type "path"
    Then  the response status should be 204

  @smoke @Priority:High
  Scenario: Staff retrieves all arboretum zones
    When  I retrieve all zones
    Then  the response status should be 200
    And   the response should be a JSON array

  @regression @Priority:Medium
  Scenario: Staff updates an existing zone
    Given a zone named "TEST_Update_Zone" of type "area" exists
    When  I update the zone named "TEST_Update_Zone" to name "TEST_Updated_Zone" and type "boundary"
    Then  the response status should be 204

  @regression @Priority:Medium
  Scenario: Staff deletes a zone
    Given a zone named "TEST_Delete_Zone" of type "path" exists
    When  I delete the zone named "TEST_Delete_Zone"
    Then  the response status should be 204

  @regression @Priority:Medium
  Scenario: Zone creation fails when zone type is invalid
    When  I create a zone named "Bad Type Zone" with type "galaxy"
    Then  the response status should be 400

  @regression @Priority:Medium
  Scenario: Zone creation fails when name is blank
    When  I create a zone named "" with type "area"
    Then  the response status should be 400
