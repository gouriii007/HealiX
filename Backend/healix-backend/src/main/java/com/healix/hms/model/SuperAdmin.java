package com.healix.hms.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

/**
 * =====================================================================
 * SuperAdmin entity - Platform Super Administrator
 * =====================================================================
 * OOP Concepts:
 *   - Inheritance: extends Admin (which extends User)
 *   - Polymorphism: overrides getRoleDisplayName()
 * =====================================================================
 */
@Entity
@DiscriminatorValue("ROLE_SUPER_ADMIN")
public class SuperAdmin extends Admin {

    public SuperAdmin() {
        super();
    }

    public SuperAdmin(String name, String email, String password, String phone) {
        super(name, email, password, phone);
    }

    @Override
    public String getRoleDisplayName() {
        return "Platform Super Administrator";
    }

    @Override
    public String toString() {
        return "SuperAdmin{id=" + getId() + ", name='" + getName() + "'}";
    }
}
