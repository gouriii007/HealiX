package com.healix.hms.controller;

import com.healix.hms.dto.MedicalRecordDto;
import com.healix.hms.model.*;
import com.healix.hms.model.enums.AppointmentStatus;
import com.healix.hms.service.*;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.time.LocalDate;
import java.util.List;

/**
 * DoctorController - handles all doctor portal requests.
 * SOLID SRP: only handles HTTP, delegates to services.
 */
@Controller
@RequestMapping("/doctor")
@PreAuthorize("hasRole('DOCTOR')")
public class DoctorController {

    private final DoctorService doctorService;
    private final AppointmentService appointmentService;
    private final MedicalRecordService medicalRecordService;
    private final PatientService patientService;
    private final NotificationService notificationService;

    public DoctorController(DoctorService doctorService, AppointmentService appointmentService,
                             MedicalRecordService medicalRecordService, PatientService patientService,
                             NotificationService notificationService) {
        this.doctorService = doctorService;
        this.appointmentService = appointmentService;
        this.medicalRecordService = medicalRecordService;
        this.patientService = patientService;
        this.notificationService = notificationService;
    }

    private Doctor getCurrentDoctor(UserDetails userDetails) {
        return doctorService.findDoctor(userDetails.getUsername());
    }

    // ---- DASHBOARD ----
    @GetMapping("/dashboard")
    public String dashboard(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        Doctor doctor = getCurrentDoctor(userDetails);
        List<Appointment> todayAppts = appointmentService.findTodaysAppointments(doctor);
        List<Appointment> allAppts = appointmentService.findByDoctor(doctor);

        long pending = allAppts.stream().filter(Appointment::isPending).count();
        long confirmed = allAppts.stream().filter(Appointment::isConfirmed).count();
        long completed = allAppts.stream().filter(Appointment::isCompleted).count();

        model.addAttribute("doctor", doctor);
        model.addAttribute("todayAppointments", todayAppts);
        model.addAttribute("todayCount", todayAppts.size());
        model.addAttribute("pendingCount", pending);
        model.addAttribute("confirmedCount", confirmed);
        model.addAttribute("completedCount", completed);
        model.addAttribute("unreadCount", notificationService.countUnread(doctor));
        return "doctor/dashboard";
    }

    // ---- APPOINTMENTS ----
    @GetMapping("/appointments")
    public String appointments(@AuthenticationPrincipal UserDetails userDetails,
                                @RequestParam(required = false) String status, Model model) {
        Doctor doctor = getCurrentDoctor(userDetails);
        List<Appointment> appointments;

        if (status != null && !status.isBlank()) {
            appointments = appointmentService.findByDoctor(doctor).stream()
                .filter(a -> a.getStatus().name().equals(status)).toList();
            model.addAttribute("selectedStatus", status);
        } else {
            appointments = appointmentService.findByDoctor(doctor);
        }

        model.addAttribute("doctor", doctor);
        model.addAttribute("appointments", appointments);
        model.addAttribute("statuses", AppointmentStatus.values());
        return "doctor/appointments";
    }

    @PostMapping("/appointments/{id}/status")
    public String updateStatus(@PathVariable Long id, @RequestParam String status,
                                @AuthenticationPrincipal UserDetails userDetails, RedirectAttributes ra) {
        try {
            appointmentService.updateStatus(id, AppointmentStatus.valueOf(status));
            ra.addFlashAttribute("success", "Appointment status updated to " + status + ".");
        } catch (Exception e) {
            ra.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/doctor/appointments";
    }

    // ---- PATIENTS ----
    @GetMapping("/patients")
    public String patients(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        Doctor doctor = getCurrentDoctor(userDetails);
        // Collect unique patients from all appointments
        List<Patient> patients = appointmentService.findByDoctor(doctor).stream()
            .map(Appointment::getPatient)
            .distinct()
            .toList();
        model.addAttribute("doctor", doctor);
        model.addAttribute("patients", patients);
        return "doctor/patients";
    }

    @GetMapping("/patients/{id}")
    public String viewPatient(@PathVariable Long id,
                               @AuthenticationPrincipal UserDetails userDetails, Model model) {
        Doctor doctor = getCurrentDoctor(userDetails);
        Patient patient = patientService.findPatient(id);
        List<MedicalRecord> records = medicalRecordService.findByPatient(patient);
        List<Appointment> appts = appointmentService.findByDoctor(doctor).stream()
            .filter(a -> a.getPatient().getId().equals(id)).toList();

        model.addAttribute("doctor", doctor);
        model.addAttribute("patient", patient);
        model.addAttribute("medicalRecords", records);
        model.addAttribute("appointments", appts);
        return "doctor/patient-view";
    }

    // ---- MEDICAL RECORDS ----
    @GetMapping("/medical-records")
    public String medicalRecords(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        Doctor doctor = getCurrentDoctor(userDetails);
        model.addAttribute("doctor", doctor);
        model.addAttribute("completedAppointments",
            appointmentService.findByDoctor(doctor).stream()
                .filter(a -> a.getStatus() == AppointmentStatus.CONFIRMED || a.getStatus() == AppointmentStatus.COMPLETED)
                .toList());
        return "doctor/medical-records";
    }

    @GetMapping("/medical-records/create/{appointmentId}")
    public String createRecordForm(@PathVariable Long appointmentId,
                                    @AuthenticationPrincipal UserDetails userDetails, Model model) {
        Appointment appointment = appointmentService.findAppointment(appointmentId);
        model.addAttribute("appointment", appointment);
        model.addAttribute("medicalRecordDto", new MedicalRecordDto());
        model.addAttribute("hasRecord", medicalRecordService.existsForAppointment(appointmentId));
        return "doctor/medical-record-form";
    }

    @PostMapping("/medical-records/create/{appointmentId}")
    public String createRecord(@PathVariable Long appointmentId,
                                @ModelAttribute MedicalRecordDto dto,
                                @AuthenticationPrincipal UserDetails userDetails,
                                RedirectAttributes ra) {
        try {
            medicalRecordService.createMedicalRecord(dto, appointmentId, userDetails.getUsername());
            // Mark appointment as completed
            appointmentService.updateStatus(appointmentId, AppointmentStatus.COMPLETED);
            ra.addFlashAttribute("success", "Medical record created and appointment marked as completed.");
        } catch (Exception e) {
            ra.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/doctor/medical-records";
    }

    @GetMapping("/medical-records/view/{id}")
    public String viewRecord(@PathVariable Long id, Model model) {
        MedicalRecord record = medicalRecordService.findById(id);
        model.addAttribute("record", record);
        return "doctor/medical-record-view";
    }

    // ---- PROFILE ----
    @GetMapping("/profile")
    public String profile(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        model.addAttribute("doctor", getCurrentDoctor(userDetails));
        return "doctor/profile";
    }

    // ---- SCHEDULE ----
    @GetMapping("/schedule")
    public String schedule(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        Doctor doctor = getCurrentDoctor(userDetails);
        model.addAttribute("doctor", doctor);
        model.addAttribute("upcomingAppointments", appointmentService.findByDoctor(doctor).stream()
            .filter(a -> !a.getAppointmentDate().isBefore(LocalDate.now()))
            .filter(a -> a.getStatus() != AppointmentStatus.CANCELLED)
            .toList());
        return "doctor/schedule";
    }

    // ---- NOTIFICATIONS ----
    @GetMapping("/notifications")
    public String notifications(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        Doctor doctor = getCurrentDoctor(userDetails);
        model.addAttribute("notifications", notificationService.getNotificationsForUser(doctor));
        notificationService.markAllAsRead(doctor);
        return "doctor/notifications";
    }
}
