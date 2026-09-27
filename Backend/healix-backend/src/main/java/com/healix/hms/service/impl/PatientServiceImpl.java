package com.healix.hms.service.impl;

import com.healix.hms.dto.PatientRegistrationDto;
import com.healix.hms.exception.PatientNotFoundException;
import com.healix.hms.model.Patient;
import com.healix.hms.model.enums.Role;
import com.healix.hms.repository.PatientRepository;
import com.healix.hms.service.PatientService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * =====================================================================
 * PatientServiceImpl - implements PatientService interface
 * =====================================================================
 * OOP / SOLID Concepts:
 *   - Implements interface (PatientService) - abstraction
 *   - Method Overloading: findPatient(Long) and findPatient(String)
 *   - SRP: only handles patient business logic
 *   - DIP: depends on PatientRepository interface, not concrete class
 *   - Constructor injection: preferred over field injection
 * =====================================================================
 */
@Service
@Transactional
public class PatientServiceImpl implements PatientService {

    // DIP: depend on abstractions
    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;

    // Constructor injection - demonstrates DIP
    public PatientServiceImpl(PatientRepository patientRepository,
                               PasswordEncoder passwordEncoder) {
        this.patientRepository = patientRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public Patient registerPatient(PatientRegistrationDto dto) {
        if (patientRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("A patient with email '" + dto.getEmail() + "' already exists.");
        }

        Patient patient = new Patient(dto.getName(), dto.getEmail(),
            passwordEncoder.encode(dto.getPassword()), dto.getPhone());
        patient.setAddress(dto.getAddress());
        patient.setDateOfBirth(dto.getDateOfBirth());
        patient.setGender(dto.getGender());
        patient.setBloodGroup(dto.getBloodGroup());
        patient.setEmergencyContact(dto.getEmergencyContact());
        patient.setEmergencyContactName(dto.getEmergencyContactName());
        patient.setRole(Role.ROLE_PATIENT);
        patient.setActive(true);

        Patient saved = patientRepository.save(patient);
        saved.setPatientIdentifier(String.format("PAT-TRV-%06d", saved.getId()));
        return patientRepository.save(saved);
    }

    @Override
    public Patient updatePatient(Long id, PatientRegistrationDto dto) {
        Patient patient = findPatient(id); // uses overloaded method

        patient.setName(dto.getName());
        patient.setPhone(dto.getPhone());
        patient.setAddress(dto.getAddress());
        patient.setDateOfBirth(dto.getDateOfBirth());
        patient.setGender(dto.getGender());
        patient.setBloodGroup(dto.getBloodGroup());
        patient.setEmergencyContact(dto.getEmergencyContact());
        patient.setEmergencyContactName(dto.getEmergencyContactName());

        // Only update password if provided
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            patient.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        return patientRepository.save(patient);
    }

    @Override
    public void deletePatient(Long id) {
        Patient patient = findPatient(id);
        patientRepository.delete(patient);
    }

    @Override
    public void deactivatePatient(Long id) {
        Patient patient = findPatient(id);
        patient.setActive(false);
        patientRepository.save(patient);
    }

    /**
     * Find patient by ID - overloaded method (demonstrates METHOD OVERLOADING)
     */
    @Override
    @Transactional(readOnly = true)
    public Patient findPatient(Long id) {
        return patientRepository.findById(id)
            .orElseThrow(() -> new PatientNotFoundException(id));
    }

    /**
     * Find patient by email - overloaded method (demonstrates METHOD OVERLOADING)
     */
    @Override
    @Transactional(readOnly = true)
    public Patient findPatient(String email) {
        return patientRepository.findByEmail(email)
            .orElseThrow(() -> new PatientNotFoundException(email));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Patient> findAllPatients() {
        return patientRepository.findByActiveTrue();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Patient> searchPatients(String query) {
        if (query == null || query.isBlank()) {
            return findAllPatients();
        }
        return patientRepository.searchByNameOrEmail(query);
    }

    @Override
    @Transactional(readOnly = true)
    public long countPatients() {
        return patientRepository.countByActiveTrue();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean emailExists(String email) {
        return patientRepository.existsByEmail(email);
    }
}
