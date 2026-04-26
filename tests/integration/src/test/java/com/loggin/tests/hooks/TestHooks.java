package com.loggin.tests.hooks;

import com.loggin.tests.support.ApiClient;
import com.loggin.tests.support.TestContext;
import io.cucumber.java.After;
import io.cucumber.java.Before;
import org.mindrot.jbcrypt.BCrypt;

import java.sql.*;

/**
 * Lifecycle hooks:
 *  @Before order=1  – open DB connection
 *  @Before order=2  – purge stale test data  (safe re-run guard)
 *  @Before order=3  – seed fresh test users, quiz, and party
 *  @After  order=1  – delete entities created during the scenario
 *  @After  order=0  – close DB connection
 *
 * All test records are identified by the email domain @goalz-test.internal
 * (users) or the name prefix TEST_ (parties, sensors, elements, zones).
 * Never touches production data.
 */
public class TestHooks {

    private final TestContext ctx;
    private Connection conn;

    public TestHooks(TestContext ctx) {
        this.ctx = ctx;
    }

    // ── Database connection ──────────────────────────────────────────────────

    @Before(order = 1)
    public void openDbConnection() throws SQLException {
        String url  = ApiClient.env("TEST_DB_URL",      "jdbc:postgresql://localhost:5432/goalz_test");
        String user = ApiClient.env("TEST_DB_USER",     "goalz");
        String pass = ApiClient.env("TEST_DB_PASSWORD", "changeme");
        conn = DriverManager.getConnection(url, user, pass);
        conn.setAutoCommit(true);
    }

    @After(order = 0)
    public void closeDbConnection() throws SQLException {
        if (conn != null && !conn.isClosed()) conn.close();
    }

    // ── Stale-data purge (runs before every scenario) ───────────────────────

    @Before(order = 2)
    public void purgeStaleTestData() throws SQLException {
        // Delete in FK-safe reverse order.
        // Wrapped in try-catch so a missing table (e.g. Zones added in later
        // migration) never aborts the entire cleanup pass.
        safeExec("DELETE FROM public.\"PartyGroupAnswers\" WHERE \"PartyGroupId\" IN " +
                 "(SELECT pg.\"Id\" FROM public.\"PartyGroups\" pg " +
                 " JOIN public.\"Parties\" p ON pg.\"PartyId\" = p.\"Id\" " +
                 " WHERE p.\"Name\" LIKE 'TEST_%')");

        safeExec("DELETE FROM public.\"PartyMembers\" WHERE \"UserId\" IN " +
                 "(SELECT \"Id\" FROM public.\"Users\" WHERE \"Email\" LIKE '%@goalz-test.internal')");

        safeExec("DELETE FROM public.\"Friendships\" WHERE " +
                 "\"RequesterId\" IN (SELECT \"Id\" FROM public.\"Users\" WHERE \"Email\" LIKE '%@goalz-test.internal') OR " +
                 "\"AddresseeId\" IN (SELECT \"Id\" FROM public.\"Users\" WHERE \"Email\" LIKE '%@goalz-test.internal')");

        safeExec("DELETE FROM public.\"PartyGroups\" WHERE \"PartyId\" IN " +
                 "(SELECT \"Id\" FROM public.\"Parties\" WHERE \"Name\" LIKE 'TEST_%')");

        safeExec("DELETE FROM public.\"Parties\" WHERE \"Name\" LIKE 'TEST_%'");

        safeExec("DELETE FROM public.\"Quizzes\" WHERE \"Id\" = " + ctx.getSeededQuizId());

        safeExec("DELETE FROM public.\"Sensors\" WHERE \"SensorName\" LIKE 'TEST_%'");

        safeExec("DELETE FROM public.\"Elements\" WHERE \"ElementName\" LIKE 'TEST_%'");

        safeExec("DELETE FROM public.\"Zones\" WHERE \"Name\" LIKE 'TEST_%'");

        safeExec("DELETE FROM public.\"Users\" WHERE \"Email\" LIKE '%@goalz-test.internal'");
    }

    // ── Seed fresh test data ─────────────────────────────────────────────────

    @Before(order = 3)
    public void seedTestData() throws SQLException {
        // ── Users ────────────────────────────────────────────────────────────
        ctx.putSeededUserId("alice", insertUser(
                "Test Alice", "alice@goalz-test.internal", "test_alice",
                BCrypt.hashpw("TestPass123!", BCrypt.gensalt()), "Player"));

        ctx.putSeededUserId("bob", insertUser(
                "Test Bob", "bob@goalz-test.internal", "test_bob",
                BCrypt.hashpw("TestPass123!", BCrypt.gensalt()), "Player"));

        ctx.putSeededUserId("admin", insertUser(
                "Test Admin", "admin@goalz-test.internal", "test_admin",
                BCrypt.hashpw("AdminPass123!", BCrypt.gensalt()), "Admin"));

        // ── Quiz (FK required by Parties) ────────────────────────────────────
        long quizId = insertQuiz();
        ctx.setSeededQuizId(quizId);

        // ── Party (used by join-party scenarios) ─────────────────────────────
        long partyId = insertParty(quizId, "TEST_Seeded_Party", 654321L);
        ctx.setSeededPartyId(partyId);

        for (String name : new String[]{"Team A", "Team B", "Team C", "Team D"}) {
            insertPartyGroup(partyId, name);
        }
    }

    // ── Post-scenario entity cleanup ─────────────────────────────────────────

    @After(order = 1)
    public void cleanupScenarioEntities() {
        // Remove sensors created during the scenario (tracked by ID)
        for (long id : ctx.getCreatedSensorIds()) {
            safeExec("DELETE FROM public.\"Sensors\" WHERE \"Id\" = " + id);
        }
        // Remove elements created during the scenario
        for (long id : ctx.getCreatedElementIds()) {
            safeExec("DELETE FROM public.\"Elements\" WHERE \"Id\" = " + id);
        }
        // Zones identified by name prefix — cleaned in purgeStaleTestData of
        // the next run; no ID tracking needed here since create returns 204.
    }

    // ── JDBC helpers ─────────────────────────────────────────────────────────

    private long insertUser(String name, String email, String username,
                            String passwordHash, String role) throws SQLException {
        try (PreparedStatement ps = conn.prepareStatement(
                "INSERT INTO public.\"Users\" " +
                "(\"Name\", \"PasswordHash\", \"Role\", \"Email\", \"Username\", \"CreatedAt\") " +
                "VALUES (?, ?, ?, ?, ?, NOW()) RETURNING \"Id\"")) {
            ps.setString(1, name);
            ps.setString(2, passwordHash);
            ps.setString(3, role);
            ps.setString(4, email);
            ps.setString(5, username);
            try (ResultSet rs = ps.executeQuery()) {
                rs.next();
                return rs.getLong(1);
            }
        }
    }

    private long insertQuiz() throws SQLException {
        try (PreparedStatement ps = conn.prepareStatement(
                "INSERT INTO public.\"Quizzes\" DEFAULT VALUES RETURNING \"Id\"")) {
            try (ResultSet rs = ps.executeQuery()) {
                rs.next();
                return rs.getLong(1);
            }
        }
    }

    private long insertParty(long quizId, String name, long code) throws SQLException {
        try (PreparedStatement ps = conn.prepareStatement(
                "INSERT INTO public.\"Parties\" (\"QuizId\", \"Name\", \"Code\") " +
                "VALUES (?, ?, ?) RETURNING \"Id\"")) {
            ps.setLong(1, quizId);
            ps.setString(2, name);
            ps.setLong(3, code);
            try (ResultSet rs = ps.executeQuery()) {
                rs.next();
                return rs.getLong(1);
            }
        }
    }

    private void insertPartyGroup(long partyId, String name) throws SQLException {
        try (PreparedStatement ps = conn.prepareStatement(
                "INSERT INTO public.\"PartyGroups\" (\"PartyId\", \"Name\") VALUES (?, ?)")) {
            ps.setLong(1, partyId);
            ps.setString(2, name);
            ps.executeUpdate();
        }
    }

    /** Executes a SQL statement, swallowing errors so missing tables don't
     *  abort the whole cleanup pass. */
    private void safeExec(String sql) {
        try (Statement st = conn.createStatement()) {
            st.execute(sql);
        } catch (SQLException ignored) {
            // Table may not exist in this migration version — that is fine.
        }
    }
}
