package com.healix.hms.model;

import com.healix.hms.model.enums.RecordSharingStatus;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * =====================================================================
 * RecordAccessRequest - Cross-hospital patient record sharing with consent
 * =====================================================================
 * Strict privacy mechanism: A doctor at Hospital A requesting access to
 * patient records created at Hospital B must receive explicit patient approval.
 * =====================================================================
 */
@Entity
@Table(name = "record_access_requests", indexes = {
        @Index(name = "idx_consent_patient", columnList = "patient_id"),
        @Index(name = "idx_consent_doctor", columnList = "requesting_doctor_id"),
        @Index(name = "idx_consent_status", columnList = "status")
})
@EntityListeners(AuditingEntityListener.class)
public class RecordAccessRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "requesting_doctor_id", nullable = false)
    private Doctor requestingDoctor;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "source_hospital_id", nullable = false)
    private Hospital sourceHospital; // Hospital holding the original records

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "target_hospital_id", nullable = false)
    private Hospital targetHospital; // Hospital where doctor is currently treating patient

    @Column(name = "record_type", length = 100)
    private String recordType = "COMPLETE_HISTORY";

    @Column(nullable = false, length = 500)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private RecordSharingStatus status = RecordSharingStatus.PENDING;

    @CreatedDate
    @Column(name = "requested_at", nullable = false, updatable = false)
    private LocalDateTime requestedAt = LocalDateTime.now();

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    public RecordAccessRequest() {}

    public boolean isCurrentlyValid() {
        return status == RecordSharingStatus.APPROVED &&
                (expiresAt == null || LocalDateTime.now().isBefore(expiresAt));
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public Doctor getRequestingDoctor() { return requestingDoctor; }
    public void setRequestingDoctor(Doctor requestingDoctor) { this.requestingDoctor = requestingDoctor; }

    public Hospital getSourceHospital() { return sourceHospital; }
    public void setSourceHospital(Hospital sourceHospital) { this.sourceHospital = sourceHospital; }

    public Hospital getTargetHospital() { return targetHospital; }
    public void setTargetHospital(Hospital targetHospital) { this.targetHospital = targetHospital; }

    public String getRecordType() { return recordType; }
    public void setRecordType(String recordType) { this.recordType = recordType; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public RecordSharingStatus getStatus() { return status; }
    public void setStatus(RecordSharingStatus status) { this.status = status; }

    public LocalDateTime getRequestedAt() { return requestedAt; }
    public void setRequestedAt(LocalDateTime requestedAt) { this.requestedAt = requestedAt; }

    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
}
