package com.healix.hms.controller;

import com.healix.hms.dto.DoctorRegistrationDto;
import com.healix.hms.dto.PatientRegistrationDto;
import com.healix.hms.model.Appointment;
import com.healix.hms.model.Department;
import com.healix.hms.model.Doctor;
import com.healix.hms.model.Patient;
import com.healix.hms.model.enums.AppointmentStatus;
import com.healix.hms.service.*;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.time.LocalDate;

/**
 * AdminController - handles all admin portal requests.
 * SOLID SRP: only handles HTTP request/response, delegates to services.
 */
@Controller
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final PatientService patientService;
    private final DoctorService doctorService;
    private final DepartmentService departmentService;
    private final AppointmentService appointmentService;
    private final ReportService reportService;

    public AdminController(PatientService patientService, DoctorService doctorService,
                            DepartmentService departmentService, AppointmentService appointmentService,
                            ReportService reportService) {
        this.patientService = patientService;
        this.doctorService = doctorService;
        this.departmentService = departmentService;
        this.appointmentService = appointmentService;
        this.reportService = reportService;
    }

    // ---- DASHBOARD ----
    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        model.addAllAttributes(reportService.getAdminDashboardStats());
        model.addAttribute("recentAppointments",
            appointmentService.findByDate(LocalDate.now()));
        return "admin/dashboard";
    }

    // ---- PATIENTS ----
    @GetMapping("/patients")
    public String patients(@RequestParam(required = false) String search, Model model) {
        model.addAttribute("patients", search != null ? patientService.searchPatients(search) : patientService.findAllPatients());
        model.addAttribute("search", search);
        return "admin/patients";
    }

    @GetMapping("/patients/add")
    public String addPatientForm(Model model) {
        model.addAttribute("patientDto", new PatientRegistrationDto());
        return "admin/patient-form";
    }

    @PostMapping("/patients/add")
    public String addPatient(@Valid @ModelAttribute("patientDto") PatientRegistrationDto dto,
                              BindingResult result, RedirectAttributes ra, Model model) {
        if (result.hasErrors()) return "admin/patient-form";
        try {
            patientService.registerPatient(dto);
            ra.addFlashAttribute("success", "Patient added successfully.");
        } catch (Exception e) {
            ra.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/admin/patients";
    }

    @GetMapping("/patients/edit/{id}")
    public String editPatientForm(@PathVariable Long id, Model model) {
        Patient patient = patientService.findPatient(id);
        PatientRegistrationDto dto = new PatientRegistrationDto();
        dto.setName(patient.getName());
        dto.setEmail(patient.getEmail());
        dto.setPhone(patient.getPhone());
        dto.setAddress(patient.getAddress());
        dto.setDateOfBirth(patient.getDateOfBirth());
        dto.setGender(patient.getGender());
        dto.setBloodGroup(patient.getBloodGroup());
        dto.setEmergencyContact(patient.getEmergencyContact());
        dto.setEmergencyContactName(patient.getEmergencyContactName());
        model.addAttribute("patientDto", dto);
        model.addAttribute("patientId", id);
        return "admin/patient-form";
    }

    @PostMapping("/patients/edit/{id}")
    public String editPatient(@PathVariable Long id,
                               @Valid @ModelAttribute("patientDto") PatientRegistrationDto dto,
                               BindingResult result, RedirectAttributes ra) {
        if (result.hasErrors()) { return "admin/patient-form"; }
        try {
            patientService.updatePatient(id, dto);
            ra.addFlashAttribute("success", "Patient updated successfully.");
        } catch (Exception e) {
            ra.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/admin/patients";
    }

    @PostMapping("/patients/deactivate/{id}")
    public String deactivatePatient(@PathVariable Long id, RedirectAttributes ra) {
        patientService.deactivatePatient(id);
        ra.addFlashAttribute("success", "Patient deactivated.");
        return "redirect:/admin/patients";
    }

    @GetMapping("/patients/view/{id}")
    public String viewPatient(@PathVariable Long id, Model model) {
        Patient patient = patientService.findPatient(id);
        model.addAttribute("patient", patient);
        return "admin/patient-view";
    }

    // ---- DOCTORS ----
    @GetMapping("/doctors")
    public String doctors(@RequestParam(required = false) String search, Model model) {
        model.addAttribute("doctors", search != null ? doctorService.searchDoctors(search) : doctorService.findAllDoctors());
        model.addAttribute("search", search);
        return "admin/doctors";
    }

    @GetMapping("/doctors/add")
    public String addDoctorForm(Model model) {
        model.addAttribute("doctorDto", new DoctorRegistrationDto());
        model.addAttribute("departments", departmentService.findActiveDepartments());
        return "admin/doctor-form";
    }

    @PostMapping("/doctors/add")
    public String addDoctor(@Valid @ModelAttribute("doctorDto") DoctorRegistrationDto dto,
                             BindingResult result, RedirectAttributes ra, Model model) {
        if (result.hasErrors()) {
            model.addAttribute("departments", departmentService.findActiveDepartments());
            return "admin/doctor-form";
        }
        try {
            doctorService.registerDoctor(dto);
            ra.addFlashAttribute("success", "Doctor added successfully.");
        } catch (Exception e) {
            ra.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/admin/doctors";
    }

    @GetMapping("/doctors/edit/{id}")
    public String editDoctorForm(@PathVariable Long id, Model model) {
        Doctor doctor = doctorService.findDoctor(id);
        DoctorRegistrationDto dto = new DoctorRegistrationDto();
        dto.setName(doctor.getName()); dto.setEmail(doctor.getEmail());
        dto.setPhone(doctor.getPhone()); dto.setAddress(doctor.getAddress());
        dto.setSpecialization(doctor.getSpecialization()); dto.setQualification(doctor.getQualification());
        dto.setBio(doctor.getBio()); dto.setExperienceYears(doctor.getExperienceYears());
        dto.setConsultationFee(doctor.getConsultationFee()); dto.setAvailability(doctor.getAvailability());
        if (doctor.getDepartment() != null) dto.setDepartmentId(doctor.getDepartment().getId());
        model.addAttribute("doctorDto", dto);
        model.addAttribute("doctorId", id);
        model.addAttribute("departments", departmentService.findActiveDepartments());
        return "admin/doctor-form";
    }

    @PostMapping("/doctors/edit/{id}")
    public String editDoctor(@PathVariable Long id,
                              @Valid @ModelAttribute("doctorDto") DoctorRegistrationDto dto,
                              BindingResult result, RedirectAttributes ra, Model model) {
        if (result.hasErrors()) {
            model.addAttribute("departments", departmentService.findActiveDepartments());
            return "admin/doctor-form";
        }
        try {
            doctorService.updateDoctor(id, dto);
            ra.addFlashAttribute("success", "Doctor updated successfully.");
        } catch (Exception e) {
            ra.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/admin/doctors";
    }

    @PostMapping("/doctors/deactivate/{id}")
    public String deactivateDoctor(@PathVariable Long id, RedirectAttributes ra) {
        doctorService.deactivateDoctor(id);
        ra.addFlashAttribute("success", "Doctor deactivated.");
        return "redirect:/admin/doctors";
    }

    // ---- DEPARTMENTS ----
    @GetMapping("/departments")
    public String departments(Model model) {
        model.addAttribute("departments", departmentService.findAllDepartments());
        model.addAttribute("newDept", new Department());
        return "admin/departments";
    }

    @PostMapping("/departments/add")
    public String addDepartment(@ModelAttribute Department department, RedirectAttributes ra) {
        try {
            departmentService.createDepartment(department);
            ra.addFlashAttribute("success", "Department created successfully.");
        } catch (Exception e) {
            ra.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/admin/departments";
    }

    @PostMapping("/departments/delete/{id}")
    public String deleteDepartment(@PathVariable Long id, RedirectAttributes ra) {
        departmentService.deleteDepartment(id);
        ra.addFlashAttribute("success", "Department deactivated.");
        return "redirect:/admin/departments";
    }

    // ---- APPOINTMENTS ----
    @GetMapping("/appointments")
    public String appointments(@RequestParam(required = false) String status,
                                @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
                                Model model) {
        if (status != null && !status.isBlank()) {
            model.addAttribute("appointments", appointmentService.findByStatus(AppointmentStatus.valueOf(status)));
            model.addAttribute("selectedStatus", status);
        } else if (date != null) {
            model.addAttribute("appointments", appointmentService.findByDate(date));
            model.addAttribute("selectedDate", date);
        } else {
            model.addAttribute("appointments", appointmentService.findAllAppointments());
        }
        model.addAttribute("statuses", AppointmentStatus.values());
        return "admin/appointments";
    }

    @PostMapping("/appointments/{id}/status")
    public String updateStatus(@PathVariable Long id, @RequestParam String status, RedirectAttributes ra) {
        try {
            appointmentService.updateStatus(id, AppointmentStatus.valueOf(status));
            ra.addFlashAttribute("success", "Appointment status updated to " + status + ".");
        } catch (Exception e) {
            ra.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/admin/appointments";
    }

    // ---- REPORTS ----
    @GetMapping("/reports")
    public String reports(@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
                           Model model) {
        LocalDate reportDate = date != null ? date : LocalDate.now();
        model.addAttribute("reportDate", reportDate);
        model.addAttribute("dailyReport", reportService.getDailyReport(reportDate));
        model.addAttribute("doctorReport", reportService.getDoctorWiseReport());
        model.addAttribute("departmentStats", reportService.getDepartmentStats());
        model.addAttribute("statusStats", reportService.getAppointmentStatusStats());
        return "admin/reports";
    }
}
