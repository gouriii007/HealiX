package com.healix.hms.service;

import com.healix.hms.model.enums.OtpPurpose;

public interface OtpService {
    String generateOtp(String identifier, OtpPurpose purpose);
    boolean verifyOtp(String identifier, String otpCode, OtpPurpose purpose);
    void resendOtp(String identifier, OtpPurpose purpose);
}
