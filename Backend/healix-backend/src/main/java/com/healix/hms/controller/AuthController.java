package com.healix.hms.controller;

import com.healix.hms.dto.PatientRegistrationDto;
import com.healix.hms.service.PatientService;
import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

/**
 * AuthController - handles login and registration.
 * Spring Security handles the actual authentication POST.
 */
@Controller
public class AuthController {

    private final PatientService patientService;

    public AuthController(PatientService patientService) {
        this.patientService = patientService;
    }

    @GetMapping("/login")
    public String loginPage(@RequestParam(required = false) String error,
                             @RequestParam(required = false) String logout,
                             @RequestParam(required = false) String expired,
                             Model model) {
        if (error != null) model.addAttribute("error", "Invalid email or password. Please try again.");
        if (logout != null) model.addAttribute("success", "You have been logged out successfully.");
        if (expired != null) model.addAttribute("error", "Your session has expired. Please login again.");
        return "login";
    }

    @GetMapping("/register")
    public String registerPage(Model model) {
        model.addAttribute("patientDto", new PatientRegistrationDto());
        return "register";
    }

    @PostMapping("/register")
    public String register(@Valid @ModelAttribute("patientDto") PatientRegistrationDto dto,
                            BindingResult result, RedirectAttributes ra, Model model) {
        if (result.hasErrors()) {
            return "register";
        }
        try {
            patientService.registerPatient(dto);
            ra.addFlashAttribute("success", "Registration successful! Please login.");
            return "redirect:/login";
        } catch (IllegalArgumentException e) {
            model.addAttribute("error", e.getMessage());
            return "register";
        }
    }
}
