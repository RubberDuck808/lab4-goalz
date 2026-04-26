package com.loggin.tests.runners;

import io.cucumber.junit.Cucumber;
import io.cucumber.junit.CucumberOptions;
import org.junit.runner.RunWith;

/**
 * JUnit 4 runner that discovers all feature files and produces
 * HTML + JSON reports. Scenarios tagged @WIP are excluded from
 * CI runs to keep the pipeline green while endpoints are pending.
 *
 * To run only smoke tests:
 *   mvn test -Dcucumber.filter.tags="@smoke"
 *
 * To include WIP (e.g. local development):
 *   mvn test -Dcucumber.filter.tags="not @impossible"
 */
@RunWith(Cucumber.class)
@CucumberOptions(
        features  = "src/test/resources/features",
        glue      = "com.loggin.tests",
        tags      = "not @WIP",
        plugin    = {
                "pretty",
                "html:target/cucumber-reports/cucumber.html",
                "json:target/cucumber-reports/cucumber.json"
        },
        monochrome = true
)
public class TestRunner {
    // JUnit 4 runner — no body required
}
