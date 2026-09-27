package com.healix.hms.repository;

import com.healix.hms.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    Optional<Department> findByName(String name);
    boolean existsByName(String name);
    List<Department> findByActiveTrue();
    List<Department> findByHospitalId(Long hospitalId);
    List<Department> findByHospitalIdAndActiveTrue(Long hospitalId);
    long countByActiveTrue();
    long countByHospitalId(Long hospitalId);
}
