package com.healix.hms;

import org.junit.jupiter.api.Test;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

import static org.junit.jupiter.api.Assertions.assertTrue;

class SupabaseConnectivityTest {

    @Test
    void testDirectOrPoolerConnection() throws Exception {
        String url = System.getenv("SUPABASE_DB_URL");
        String username = System.getenv("SUPABASE_DB_USERNAME");
        String password = System.getenv("SUPABASE_DB_PASSWORD");

        if (url == null || url.isBlank()) {
            url = "jdbc:postgresql://aws-0-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require";
            username = "postgres.sfipnjknotlfbfhdlenr";
            password = "Healix2026#Supabase!Secure";
        }

        System.out.println("Connecting to Supabase: " + url + " as " + username);
        Class.forName("org.postgresql.Driver");
        try (Connection conn = DriverManager.getConnection(url, username, password);
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT version(), current_database(), current_user")) {
            assertTrue(rs.next());
            System.out.println("Supabase PostgreSQL Version: " + rs.getString(1));
            System.out.println("Database: " + rs.getString(2));
            System.out.println("Connected User: " + rs.getString(3));
        }
    }
}
