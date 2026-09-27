package com.healix.hms.security;

import com.healix.hms.exception.HospitalAccessDeniedException;
import com.healix.hms.model.Admin;
import com.healix.hms.model.Doctor;
import com.healix.hms.model.User;
import com.healix.hms.model.enums.Role;
import com.healix.hms.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

/**
 * =====================================================================
 * HospitalSecurityService - Enforces multi-hospital tenant isolation
 * =====================================================================
 * Validates in the service/security layer:
 * CurrentUser.hospitalId == Resource.hospitalId
 * Super Admin bypasses single-hospital scoping.
 * =====================================================================
 */
@Service
public class HospitalSecurityService {

    private final UserRepository userRepository;

    public HospitalSecurityService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getCurrentAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        return userRepository.findByEmail(auth.getName()).orElse(null);
    }

    public Long getCurrentHospitalId() {
        User user = getCurrentAuthenticatedUser();
        if (user == null) return null;

        if (user instanceof Admin admin) {
            return admin.getHospital() != null ? admin.getHospital().getId() : null;
        } else if (user instanceof Doctor doctor) {
            return doctor.getHospital() != null ? doctor.getHospital().getId() : null;
        }
        return null;
    }

    public void validateHospitalAccess(Long resourceHospitalId) {
        User user = getCurrentAuthenticatedUser();
        if (user == null) {
            throw new HospitalAccessDeniedException("Authentication required to access hospital resource.");
        }

        // Platform Super Admin can access all hospitals
        if (user.getRole() == Role.ROLE_SUPER_ADMIN || (user.getRole() == Role.ROLE_ADMIN && !(user instanceof Admin admin && admin.getHospital() != null))) {
            return;
        }

        Long userHospitalId = getCurrentHospitalId();
        if (userHospitalId == null || !userHospitalId.equals(resourceHospitalId)) {
            throw new HospitalAccessDeniedException("Access Denied: You do not have authorization for Hospital ID: " + resourceHospitalId);
        }
    }
}
