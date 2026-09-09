package com.healix.hms.repository;

import com.healix.hms.model.Doctor;
import com.healix.hms.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByEmail(String email);
    boolean existsByEmail(String email);
    List<Doctor> findByDepartment(Department department);
    List<Doctor> findByActiveTrue();
    List<Doctor> findBySpecializationContainingIgnoreCase(String specialization);
    long countByActiveTrue();

    @Query("SELECT d FROM Doctor d WHERE LOWER(d.name) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(d.specialization) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<Doctor> searchByNameOrSpecialization(@Param("q") String query);

    List<Doctor> findByDepartmentAndActiveTrue(Department department);
}
