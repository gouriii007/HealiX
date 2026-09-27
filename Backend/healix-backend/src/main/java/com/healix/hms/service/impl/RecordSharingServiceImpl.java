package com.healix.hms.service.impl;

import com.healix.hms.exception.UnauthorizedRecordAccessException;
import com.healix.hms.model.Doctor;
import com.healix.hms.model.Hospital;
import com.healix.hms.model.Patient;
import com.healix.hms.model.RecordAccessRequest;
import com.healix.hms.model.enums.RecordSharingStatus;
import com.healix.hms.repository.DoctorRepository;
import com.healix.hms.repository.HospitalRepository;
import com.healix.hms.repository.PatientRepository;
import com.healix.hms.repository.RecordAccessRequestRepository;
import com.healix.hms.service.RecordSharingService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class RecordSharingServiceImpl implements RecordSharingService {

    private final RecordAccessRequestRepository recordAccessRequestRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final HospitalRepository hospitalRepository;

    public RecordSharingServiceImpl(RecordAccessRequestRepository recordAccessRequestRepository,
                                    PatientRepository patientRepository,
                                    DoctorRepository doctorRepository,
                                    HospitalRepository hospitalRepository) {
        this.recordAccessRequestRepository = recordAccessRequestRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.hospitalRepository = hospitalRepository;
    }

    @Override
    public RecordAccessRequest requestRecordAccess(Long patientId, Long doctorId, Long sourceHospitalId,
                                                   Long targetHospitalId, String reason) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found: " + patientId));
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found: " + doctorId));
        Hospital sourceHospital = hospitalRepository.findById(sourceHospitalId)
                .orElseThrow(() -> new IllegalArgumentException("Source Hospital not found: " + sourceHospitalId));
        Hospital targetHospital = hospitalRepository.findById(targetHospitalId)
                .orElseThrow(() -> new IllegalArgumentException("Target Hospital not found: " + targetHospitalId));

        RecordAccessRequest request = new RecordAccessRequest();
        request.setPatient(patient);
        request.setRequestingDoctor(doctor);
        request.setSourceHospital(sourceHospital);
        request.setTargetHospital(targetHospital);
        request.setReason(reason);
        request.setStatus(RecordSharingStatus.PENDING);
        request.setRequestedAt(LocalDateTime.now());
        return recordAccessRequestRepository.save(request);
    }

    @Override
    public RecordAccessRequest approveRequest(Long requestId, Long patientId, int validDays) {
        RecordAccessRequest request = recordAccessRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found: " + requestId));

        if (!request.getPatient().getId().equals(patientId)) {
            throw new UnauthorizedRecordAccessException("Only the patient can approve this record sharing request.");
        }

        request.setStatus(RecordSharingStatus.APPROVED);
        request.setApprovedAt(LocalDateTime.now());
        request.setExpiresAt(LocalDateTime.now().plusDays(validDays > 0 ? validDays : 7));
        return recordAccessRequestRepository.save(request);
    }

    @Override
    public RecordAccessRequest rejectRequest(Long requestId, Long patientId) {
        RecordAccessRequest request = recordAccessRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found: " + requestId));

        if (!request.getPatient().getId().equals(patientId)) {
            throw new UnauthorizedRecordAccessException("Only the patient can reject this record sharing request.");
        }

        request.setStatus(RecordSharingStatus.REJECTED);
        return recordAccessRequestRepository.save(request);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RecordAccessRequest> getRequestsForPatient(Long patientId) {
        return recordAccessRequestRepository.findByPatientId(patientId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RecordAccessRequest> getPendingRequestsForPatient(Long patientId) {
        return recordAccessRequestRepository.findByPatientIdAndStatus(patientId, RecordSharingStatus.PENDING);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasDoctorAccessToRecord(Long doctorId, Long patientId, Long recordHospitalId) {
        Doctor doctor = doctorRepository.findById(doctorId).orElse(null);
        if (doctor == null) return false;

        // 1. If record belongs to doctor's primary hospital, access is permitted
        if (doctor.getHospital() != null && doctor.getHospital().getId().equals(recordHospitalId)) {
            return true;
        }

        // 2. Otherwise, check for an active, approved RecordAccessRequest from the patient
        List<RecordAccessRequest> approved = recordAccessRequestRepository
                .findByPatientIdAndRequestingDoctorIdAndStatus(patientId, doctorId, RecordSharingStatus.APPROVED);

        return approved.stream().anyMatch(RecordAccessRequest::isCurrentlyValid);
    }
}
