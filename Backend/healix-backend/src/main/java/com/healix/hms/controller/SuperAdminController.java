package com.healix.hms.controller;

import com.healix.hms.model.Hospital;
import com.healix.hms.model.enums.HospitalStatus;
import com.healix.hms.repository.DoctorRepository;
import com.healix.hms.repository.PatientRepository;
import com.healix.hms.service.AuditLogService;
import com.healix.hms.service.HospitalService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/super-admin")
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
public class SuperAdminController {

    private final HospitalService hospitalService;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AuditLogService auditLogService;

    public SuperAdminController(HospitalService hospitalService,
                                PatientRepository patientRepository,
                                DoctorRepository doctorRepository,
                                AuditLogService auditLogService) {
        this.hospitalService = hospitalService;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.auditLogService = auditLogService;
    }

    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        model.addAttribute("totalHospitals", hospitalService.countTotalHospitals());
        model.addAttribute("activeHospitals", hospitalService.countActiveHospitals());
        model.addAttribute("totalPatients", patientRepository.count());
        model.addAttribute("totalDoctors", doctorRepository.count());
        model.addAttribute("hospitals", hospitalService.getAllHospitals());
        model.addAttribute("auditLogs", auditLogService.getRecentPlatformLogs());
        return "super-admin/dashboard";
    }

    @GetMapping("/hospitals")
    public String manageHospitals(Model model) {
        model.addAttribute("hospitals", hospitalService.getAllHospitals());
        model.addAttribute("newHospital", new Hospital());
        return "super-admin/hospitals";
    }

    @PostMapping("/hospitals/save")
    public String saveHospital(@ModelAttribute("newHospital") Hospital hospital, RedirectAttributes ra) {
        try {
            if (hospital.getId() != null) {
                hospitalService.updateHospital(hospital.getId(), hospital);
                ra.addFlashAttribute("successMessage", "Hospital updated successfully!");
            } else {
                hospitalService.createHospital(hospital);
                ra.addFlashAttribute("successMessage", "New Hospital registered successfully!");
            }
        } catch (Exception e) {
            ra.addFlashAttribute("errorMessage", "Error saving hospital: " + e.getMessage());
        }
        return "redirect:/super-admin/hospitals";
    }

    @PostMapping("/hospitals/{id}/status")
    public String toggleHospitalStatus(@PathVariable("id") Long id,
                                       @RequestParam("status") HospitalStatus status,
                                       RedirectAttributes ra) {
        hospitalService.updateHospitalStatus(id, status);
        ra.addFlashAttribute("successMessage", "Hospital status updated to " + status);
        return "redirect:/super-admin/hospitals";
    }
}
