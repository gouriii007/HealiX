package com.healix.hms.repository;

import com.healix.hms.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByEmail(String email);
    boolean existsByEmail(String email);

    @Query("SELECT p FROM Patient p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%')) OR LOWER(p.email) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Patient> searchByNameOrEmail(@Param("name") String name);

    List<Patient> findByActiveTrue();
    long countByActiveTrue();
}
