package com.healix.hms.model.enums;

/**
 * Role enum - defines user roles in the system.
 * Extended for Multi-Hospital Enterprise RBAC.
 * Demonstrates: Enum usage, static final constants
 */
public enum Role {
    ROLE_SUPER_ADMIN,
    ROLE_HOSPITAL_ADMIN,
    ROLE_ADMIN,        // preserved for backward compatibility
    ROLE_DOCTOR,
    ROLE_PATIENT,
    ROLE_RECEPTIONIST
}
