package com.healix.hms.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

/**
 * =====================================================================
 * HospitalAdmin entity - Hospital-level Administrator
 * =====================================================================
 * OOP Concepts:
 *   - Inheritance: extends Admin (which extends User)
 *   - Polymorphism: overrides getRoleDisplayName()
 * =====================================================================
 */
@Entity
@DiscriminatorValue("ROLE_HOSPITAL_ADMIN")
public class HospitalAdmin extends Admin {

    public HospitalAdmin() {
        super();
    }

    public HospitalAdmin(String name, String email, String password, String phone) {
        super(name, email, password, phone);
    }

    @Override
    public String getRoleDisplayName() {
        return "Hospital Administrator";
    }

    @Override
    public String toString() {
        return "HospitalAdmin{id=" + getId() + ", name='" + getName() + "'}";
    }
}
