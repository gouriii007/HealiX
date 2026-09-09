package com.healix.hms.util;

/**
 * =====================================================================
 * AppConstants - demonstrates static and final members in OOP
 * =====================================================================
 * OOP Concepts:
 *   - static: class-level constants, no instance needed
 *   - final: immutable values that cannot be changed
 *   - Utility class with private constructor (cannot be instantiated)
 * =====================================================================
 */
public final class AppConstants {

    // Prevent instantiation of this utility class
    private AppConstants() {
        throw new UnsupportedOperationException("AppConstants is a utility class and cannot be instantiated.");
    }

    // ---- Appointment constants ----
    public static final int MAX_APPOINTMENTS_PER_DAY = 20;
    public static final int DEFAULT_APPOINTMENT_DURATION_MINUTES = 30;
    public static final int MIN_BOOKING_ADVANCE_HOURS = 1;

    // ---- Pagination ----
    public static final int DEFAULT_PAGE_SIZE = 10;
    public static final int MAX_PAGE_SIZE = 50;

    // ---- Roles ----
    public static final String ROLE_ADMIN = "ROLE_ADMIN";
    public static final String ROLE_DOCTOR = "ROLE_DOCTOR";
    public static final String ROLE_PATIENT = "ROLE_PATIENT";

    // ---- Hospital Info ----
    public static final String HOSPITAL_NAME = "Healix Hospital";
    public static final String HOSPITAL_EMAIL = "contact@healix.com";
    public static final String HOSPITAL_PHONE = "+91-9876543210";
    public static final String HOSPITAL_ADDRESS = "123 Medical Avenue, Health City, Kerala - 682001";

    // ---- Password Policy ----
    public static final int MIN_PASSWORD_LENGTH = 8;

    // ---- Time slots ----
    public static final String[] MORNING_SLOTS = {
        "09:00", "09:30", "10:00", "10:30", "11:00", "11:30"
    };
    public static final String[] AFTERNOON_SLOTS = {
        "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
    };
    public static final String[] EVENING_SLOTS = {
        "17:00", "17:30", "18:00", "18:30"
    };

    // ---- Session attributes ----
    public static final String SESSION_USER = "currentUser";
    public static final String SESSION_ROLE = "userRole";
}
