package com.healix.hms.repository;

import com.healix.hms.model.OtpVerification;
import com.healix.hms.model.enums.OtpPurpose;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {
    Optional<OtpVerification> findTopByIdentifierAndPurposeOrderByCreatedAtDesc(String identifier, OtpPurpose purpose);
    Optional<OtpVerification> findTopByIdentifierOrderByCreatedAtDesc(String identifier);
}
