package com.healix.hms.repository;

import com.healix.hms.model.MedicalRecord;
import com.healix.hms.model.Patient;
import com.healix.hms.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
    List<MedicalRecord> findByPatient(Patient patient);
    List<MedicalRecord> findByDoctor(Doctor doctor);
    List<MedicalRecord> findByPatientOrderByCreatedAtDesc(Patient patient);
    Optional<MedicalRecord> findByAppointmentId(Long appointmentId);
    boolean existsByAppointmentId(Long appointmentId);
}
