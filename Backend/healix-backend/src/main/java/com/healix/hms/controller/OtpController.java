package com.healix.hms.controller;

import com.healix.hms.model.enums.OtpPurpose;
import com.healix.hms.service.OtpService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/auth/otp")
public class OtpController {

    private final OtpService otpService;

    public OtpController(OtpService otpService) {
        this.otpService = otpService;
    }

    @GetMapping("/verify")
    public String showVerifyPage(@RequestParam("identifier") String identifier,
                                 @RequestParam(value = "purpose", defaultValue = "REGISTRATION") String purpose,
                                 Model model) {
        model.addAttribute("identifier", identifier);
        model.addAttribute("purpose", purpose);
        return "auth/otp-verify";
    }

    @PostMapping("/verify")
    public String verifyOtp(@RequestParam("identifier") String identifier,
                            @RequestParam("otpCode") String otpCode,
                            @RequestParam("purpose") String purposeStr,
                            RedirectAttributes ra) {
        try {
            OtpPurpose purpose = OtpPurpose.valueOf(purposeStr.toUpperCase());
            otpService.verifyOtp(identifier, otpCode, purpose);
            ra.addFlashAttribute("success", "Verification successful! You can now proceed to login.");
            return "redirect:/login";
        } catch (Exception e) {
            ra.addFlashAttribute("errorMessage", e.getMessage());
            return "redirect:/auth/otp/verify?identifier=" + identifier + "&purpose=" + purposeStr;
        }
    }

    @PostMapping("/resend")
    public String resendOtp(@RequestParam("identifier") String identifier,
                            @RequestParam("purpose") String purposeStr,
                            RedirectAttributes ra) {
        try {
            OtpPurpose purpose = OtpPurpose.valueOf(purposeStr.toUpperCase());
            String code = otpService.generateOtp(identifier, purpose);
            ra.addFlashAttribute("infoMessage", "A new OTP code has been sent. (Demo Code: " + code + ")");
        } catch (Exception e) {
            ra.addFlashAttribute("errorMessage", e.getMessage());
        }
        return "redirect:/auth/otp/verify?identifier=" + identifier + "&purpose=" + purposeStr;
    }
}
