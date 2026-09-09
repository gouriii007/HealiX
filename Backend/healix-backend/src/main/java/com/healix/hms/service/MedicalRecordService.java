package com.healix.hms.service;

import com.healix.hms.dto.MedicalRecordDto;
import com.healix.hms.model.MedicalRecord;
import com.healix.hms.model.Patient;

import java.util.List;

/**
 * MedicalRecordService interface - demonstrates ABSTRACTION and INTERFACE.
 */
public interface MedicalRecordService {

    MedicalRecord createMedicalRecord(MedicalRecordDto dto, Long appointmentId, String doctorEmail);
    MedicalRecord updateMedicalRecord(Long id, MedicalRecordDto dto);
    MedicalRecord findById(Long id);
    MedicalRecord findByAppointmentId(Long appointmentId);

    List<MedicalRecord> findByPatient(Patient patient);
    List<MedicalRecord> findByPatientId(Long patientId);
    boolean existsForAppointment(Long appointmentId);
}
