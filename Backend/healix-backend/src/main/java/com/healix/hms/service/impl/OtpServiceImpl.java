package com.healix.hms.service.impl;

import com.healix.hms.exception.InvalidOtpException;
import com.healix.hms.exception.OtpExpiredException;
import com.healix.hms.model.OtpVerification;
import com.healix.hms.model.enums.OtpPurpose;
import com.healix.hms.pattern.adapter.NotificationAdapter;
import com.healix.hms.repository.OtpVerificationRepository;
import com.healix.hms.service.OtpService;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@Transactional
public class OtpServiceImpl implements OtpService {

    private final OtpVerificationRepository otpRepository;
    private final NotificationAdapter smsNotificationAdapter;
    private final NotificationAdapter emailNotificationAdapter;
    private final SecureRandom secureRandom = new SecureRandom();

    public OtpServiceImpl(OtpVerificationRepository otpRepository,
                          @Qualifier("smsNotificationAdapter") NotificationAdapter smsNotificationAdapter,
                          @Qualifier("emailNotificationAdapter") NotificationAdapter emailNotificationAdapter) {
        this.otpRepository = otpRepository;
        this.smsNotificationAdapter = smsNotificationAdapter;
        this.emailNotificationAdapter = emailNotificationAdapter;
    }

    @Override
    public String generateOtp(String identifier, OtpPurpose purpose) {
        // Generate a cryptographically secure 6-digit numeric OTP
        int number = 100000 + secureRandom.nextInt(900000);
        String code = String.valueOf(number);

        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(5); // 5-minute expiry
        OtpVerification verification = new OtpVerification(identifier, code, purpose, expiresAt);
        otpRepository.save(verification);

        // Dispatch via appropriate notification adapter
        if (identifier != null && identifier.contains("@")) {
            emailNotificationAdapter.sendNotification(
                    identifier,
                    identifier,
                    "OTP Verification Code",
                    "Your Healix verification code is: " + code + ". Valid for 5 minutes. Do not share this OTP."
            );
        } else {
            smsNotificationAdapter.sendNotification(
                    identifier,
                    identifier,
                    "OTP Verification Code",
                    "Your Healix verification code is: " + code + ". Valid for 5 minutes. Do not share this OTP."
            );
        }

        return code;
    }

    @Override
    public boolean verifyOtp(String identifier, String otpCode, OtpPurpose purpose) {
        OtpVerification record = otpRepository.findTopByIdentifierAndPurposeOrderByCreatedAtDesc(identifier, purpose)
                .orElseThrow(() -> new InvalidOtpException("No OTP requested for identifier: " + identifier));

        if (record.isVerified()) {
            throw new InvalidOtpException("This OTP has already been used.");
        }

        if (record.isExpired()) {
            throw new OtpExpiredException("This OTP has expired. Please request a new code.");
        }

        if (record.getAttempts() >= 5) {
            throw new InvalidOtpException("Maximum verification attempts exceeded. Please request a new OTP.");
        }

        record.setAttempts(record.getAttempts() + 1);

        if (!record.getOtpCode().trim().equals(otpCode.trim())) {
            otpRepository.save(record);
            throw new InvalidOtpException("Invalid OTP code entered. Attempts left: " + (5 - record.getAttempts()));
        }

        record.setVerified(true);
        otpRepository.save(record);
        return true;
    }

    @Override
    public void resendOtp(String identifier, OtpPurpose purpose) {
        generateOtp(identifier, purpose);
    }
}
