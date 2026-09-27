package com.healix.hms.repository;

import com.healix.hms.model.Hospital;
import com.healix.hms.model.Patient;
import com.healix.hms.model.PatientHospital;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientHospitalRepository extends JpaRepository<PatientHospital, Long> {
    List<PatientHospital> findByPatient(Patient patient);
    List<PatientHospital> findByPatientId(Long patientId);
    List<PatientHospital> findByHospital(Hospital hospital);
    List<PatientHospital> findByHospitalId(Long hospitalId);
    Optional<PatientHospital> findByPatientAndHospital(Patient patient, Hospital hospital);
    Optional<PatientHospital> findByPatientIdAndHospitalId(Long patientId, Long hospitalId);
    boolean existsByPatientAndHospital(Patient patient, Hospital hospital);
    long countByHospitalId(Long hospitalId);
}
