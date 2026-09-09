package com.healix.hms.service;

import com.healix.hms.dto.DoctorRegistrationDto;
import com.healix.hms.model.Doctor;
import com.healix.hms.model.Department;

import java.util.List;

/**
 * DoctorService interface - demonstrates ABSTRACTION and INTERFACE
 * SOLID ISP: focused interface for doctor operations only.
 */
public interface DoctorService {

    Doctor registerDoctor(DoctorRegistrationDto dto);
    Doctor updateDoctor(Long id, DoctorRegistrationDto dto);
    void deleteDoctor(Long id);
    void deactivateDoctor(Long id);

    // Overloaded methods - METHOD OVERLOADING
    Doctor findDoctor(Long id);
    Doctor findDoctor(String email);

    List<Doctor> findAllDoctors();
    List<Doctor> findDoctorsByDepartment(Department department);
    List<Doctor> findDoctorsByDepartment(Long departmentId);
    List<Doctor> searchDoctors(String query);
    long countDoctors();
    boolean emailExists(String email);
}
