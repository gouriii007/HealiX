package com.healix.hms.pattern.singleton;

/**
 * =====================================================================
 * HospitalConfiguration - SINGLETON DESIGN PATTERN
 * =====================================================================
 * OOP / Design Pattern Concepts:
 *   - Singleton: ensures only ONE instance exists throughout the application
 *   - private constructor: prevents external instantiation
 *   - static instance: class-level single instance
 *   - Thread-safe: uses double-checked locking
 *
 * Use Case: Holds hospital-wide configuration that is loaded once
 * and shared across the entire application. Avoids redundant DB calls
 * for static hospital settings.
 *
 * Note: In Spring apps, Spring Beans are singletons by default.
 * This class demonstrates the classic Singleton pattern for academic purposes.
 * =====================================================================
 */
public class HospitalConfiguration {

    // static: class-level reference to the single instance
    private static volatile HospitalConfiguration instance;

    // Hospital configuration fields
    private final String hospitalName;
    private final String hospitalEmail;
    private final String hospitalPhone;
    private final String hospitalAddress;
    private final int maxAppointmentsPerDay;
    private final int appointmentDurationMinutes;
    private final boolean emergencyServicesAvailable;
    private final String workingHours;

    // private constructor - prevents external instantiation
    private HospitalConfiguration() {
        this.hospitalName = "Healix Hospital";
        this.hospitalEmail = "contact@healix.com";
        this.hospitalPhone = "+91-9876543210";
        this.hospitalAddress = "123 Medical Avenue, Health City, Kerala - 682001";
        this.maxAppointmentsPerDay = 20;
        this.appointmentDurationMinutes = 30;
        this.emergencyServicesAvailable = true;
        this.workingHours = "Monday - Saturday: 9:00 AM - 6:00 PM";
    }

    /**
     * Returns the single instance of HospitalConfiguration.
     * Thread-safe double-checked locking pattern.
     */
    public static HospitalConfiguration getInstance() {
        if (instance == null) {
            synchronized (HospitalConfiguration.class) {
                if (instance == null) {
                    instance = new HospitalConfiguration();
                }
            }
        }
        return instance;
    }

    // ---- Getters (read-only, fields are final) ----
    public String getHospitalName() { return hospitalName; }
    public String getHospitalEmail() { return hospitalEmail; }
    public String getHospitalPhone() { return hospitalPhone; }
    public String getHospitalAddress() { return hospitalAddress; }
    public int getMaxAppointmentsPerDay() { return maxAppointmentsPerDay; }
    public int getAppointmentDurationMinutes() { return appointmentDurationMinutes; }
    public boolean isEmergencyServicesAvailable() { return emergencyServicesAvailable; }
    public String getWorkingHours() { return workingHours; }

    @Override
    public String toString() {
        return "HospitalConfiguration{name='" + hospitalName + "', maxAppointments=" + maxAppointmentsPerDay + "}";
    }
}
