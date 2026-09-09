package com.healix.hms.service;

import com.healix.hms.dto.PatientRegistrationDto;
import com.healix.hms.model.Patient;

import java.util.List;

/**
 * =====================================================================
 * PatientService interface - demonstrates ABSTRACTION and INTERFACE
 * =====================================================================
 * OOP Concepts:
 *   - Interface: defines service contract without implementation
 *   - Method Overloading: findPatient(Long id) and findPatient(String email)
 *   - Abstraction: hides implementation details from callers
 *   - SOLID ISP: focused interface, only patient-related methods
 * =====================================================================
 */
public interface PatientService {

    Patient registerPatient(PatientRegistrationDto dto);
    Patient updatePatient(Long id, PatientRegistrationDto dto);
    void deletePatient(Long id);
    void deactivatePatient(Long id);

    // Overloaded methods - demonstrates METHOD OVERLOADING (Polymorphism)
    Patient findPatient(Long id);
    Patient findPatient(String email);

    List<Patient> findAllPatients();
    List<Patient> searchPatients(String query);
    long countPatients();
    boolean emailExists(String email);
}
