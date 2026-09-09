package com.healix.hms.service.impl;

import com.healix.hms.dto.DoctorRegistrationDto;
import com.healix.hms.exception.DepartmentNotFoundException;
import com.healix.hms.exception.DoctorNotFoundException;
import com.healix.hms.model.Department;
import com.healix.hms.model.Doctor;
import com.healix.hms.model.enums.Role;
import com.healix.hms.repository.DepartmentRepository;
import com.healix.hms.repository.DoctorRepository;
import com.healix.hms.service.DoctorService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * DoctorServiceImpl - implements DoctorService interface.
 * Demonstrates SOLID SRP, DIP, method overloading.
 */
@Service
@Transactional
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    public DoctorServiceImpl(DoctorRepository doctorRepository,
                              DepartmentRepository departmentRepository,
                              PasswordEncoder passwordEncoder) {
        this.doctorRepository = doctorRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public Doctor registerDoctor(DoctorRegistrationDto dto) {
        if (doctorRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("A doctor with email '" + dto.getEmail() + "' already exists.");
        }

        Department department = departmentRepository.findById(dto.getDepartmentId())
            .orElseThrow(() -> new DepartmentNotFoundException(dto.getDepartmentId()));

        Doctor doctor = new Doctor(dto.getName(), dto.getEmail(),
            passwordEncoder.encode(dto.getPassword()), dto.getPhone(),
            dto.getSpecialization(), dto.getQualification());

        doctor.setAddress(dto.getAddress());
        doctor.setBio(dto.getBio());
        doctor.setExperienceYears(dto.getExperienceYears());
        doctor.setConsultationFee(dto.getConsultationFee());
        doctor.setAvailability(dto.getAvailability());
        doctor.setDepartment(department);
        doctor.setRole(Role.ROLE_DOCTOR);
        doctor.setActive(true);

        return doctorRepository.save(doctor);
    }

    @Override
    public Doctor updateDoctor(Long id, DoctorRegistrationDto dto) {
        Doctor doctor = findDoctor(id);

        doctor.setName(dto.getName());
        doctor.setPhone(dto.getPhone());
        doctor.setAddress(dto.getAddress());
        doctor.setSpecialization(dto.getSpecialization());
        doctor.setQualification(dto.getQualification());
        doctor.setBio(dto.getBio());
        doctor.setExperienceYears(dto.getExperienceYears());
        doctor.setConsultationFee(dto.getConsultationFee());
        doctor.setAvailability(dto.getAvailability());

        if (dto.getDepartmentId() != null) {
            Department department = departmentRepository.findById(dto.getDepartmentId())
                .orElseThrow(() -> new DepartmentNotFoundException(dto.getDepartmentId()));
            doctor.setDepartment(department);
        }

        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            doctor.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        return doctorRepository.save(doctor);
    }

    @Override
    public void deleteDoctor(Long id) {
        doctorRepository.delete(findDoctor(id));
    }

    @Override
    public void deactivateDoctor(Long id) {
        Doctor doctor = findDoctor(id);
        doctor.setActive(false);
        doctorRepository.save(doctor);
    }

    // Overloaded: findDoctor(Long) - demonstrates METHOD OVERLOADING
    @Override
    @Transactional(readOnly = true)
    public Doctor findDoctor(Long id) {
        return doctorRepository.findById(id)
            .orElseThrow(() -> new DoctorNotFoundException(id));
    }

    // Overloaded: findDoctor(String) - demonstrates METHOD OVERLOADING
    @Override
    @Transactional(readOnly = true)
    public Doctor findDoctor(String email) {
        return doctorRepository.findByEmail(email)
            .orElseThrow(() -> new DoctorNotFoundException(email));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Doctor> findAllDoctors() {
        return doctorRepository.findByActiveTrue();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Doctor> findDoctorsByDepartment(Department department) {
        return doctorRepository.findByDepartmentAndActiveTrue(department);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Doctor> findDoctorsByDepartment(Long departmentId) {
        Department dept = departmentRepository.findById(departmentId)
            .orElseThrow(() -> new DepartmentNotFoundException(departmentId));
        return findDoctorsByDepartment(dept);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Doctor> searchDoctors(String query) {
        if (query == null || query.isBlank()) return findAllDoctors();
        return doctorRepository.searchByNameOrSpecialization(query);
    }

    @Override
    @Transactional(readOnly = true)
    public long countDoctors() {
        return doctorRepository.countByActiveTrue();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean emailExists(String email) {
        return doctorRepository.existsByEmail(email);
    }
}
