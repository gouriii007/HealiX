package com.healix.hms.repository;

import com.healix.hms.model.Doctor;
import com.healix.hms.model.Patient;
import com.healix.hms.model.RecordAccessRequest;
import com.healix.hms.model.enums.RecordSharingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecordAccessRequestRepository extends JpaRepository<RecordAccessRequest, Long> {
    List<RecordAccessRequest> findByPatient(Patient patient);
    List<RecordAccessRequest> findByPatientId(Long patientId);
    List<RecordAccessRequest> findByPatientIdAndStatus(Long patientId, RecordSharingStatus status);
    List<RecordAccessRequest> findByRequestingDoctor(Doctor doctor);
    List<RecordAccessRequest> findByRequestingDoctorId(Long doctorId);
    List<RecordAccessRequest> findByPatientIdAndRequestingDoctorIdAndStatus(Long patientId, Long doctorId, RecordSharingStatus status);
}
