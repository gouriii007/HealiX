package com.healix.hms.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.env.Environment;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
class DatabaseInitializationConfigTest {

    @Autowired
    private Environment environment;

    @Test
    void sqlInitModeShouldLoadDemoCredentialsOnStartup() {
        assertEquals("always", environment.getProperty("spring.sql.init.mode"),
            "Demo users must be initialized on application startup so admin, doctor and patient logins work.");
    }
}
