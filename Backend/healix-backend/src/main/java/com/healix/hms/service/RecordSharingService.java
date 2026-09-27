package com.healix.hms.service;

import com.healix.hms.model.RecordAccessRequest;
import com.healix.hms.model.enums.RecordSharingStatus;

import java.util.List;

public interface RecordSharingService {
    RecordAccessRequest requestRecordAccess(Long patientId, Long doctorId, Long sourceHospitalId,
                                           Long targetHospitalId, String reason);
    RecordAccessRequest approveRequest(Long requestId, Long patientId, int validDays);
    RecordAccessRequest rejectRequest(Long requestId, Long patientId);
    List<RecordAccessRequest> getRequestsForPatient(Long patientId);
    List<RecordAccessRequest> getPendingRequestsForPatient(Long patientId);
    boolean hasDoctorAccessToRecord(Long doctorId, Long patientId, Long recordHospitalId);
}
