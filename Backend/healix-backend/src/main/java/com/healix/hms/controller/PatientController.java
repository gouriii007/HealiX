package com.healix.hms.controller;

import com.healix.hms.dto.AppointmentBookingDto;
import com.healix.hms.dto.PatientRegistrationDto;
import com.healix.hms.model.*;
import com.healix.hms.model.enums.AppointmentStatus;
import com.healix.hms.service.*;
import com.healix.hms.util.AppConstants;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

/**
 * PatientController - handles all patient portal requests.
 * SOLID SRP: only handles HTTP, delegates to services.
 */
@Controller
@RequestMapping("/patient")
@PreAuthorize("hasRole('PATIENT')")
public class PatientController {

    private final PatientService patientService;
    private final AppointmentService appointmentService;
    private final DoctorService doctorService;
    private final DepartmentService departmentService;
    private final MedicalRecordService medicalRecordService;
    private final NotificationService notificationService;
    private final HospitalService hospitalService;
    private final PaymentService paymentService;
    private final com.healix.hms.repository.PatientHospitalRepository patientHospitalRepository;
    private final RecordSharingService recordSharingService;

    public PatientController(PatientService patientService, AppointmentService appointmentService,
                              DoctorService doctorService, DepartmentService departmentService,
                              MedicalRecordService medicalRecordService, NotificationService notificationService,
                              HospitalService hospitalService, PaymentService paymentService,
                              com.healix.hms.repository.PatientHospitalRepository patientHospitalRepository,
                              RecordSharingService recordSharingService) {
        this.patientService = patientService;
        this.appointmentService = appointmentService;
        this.doctorService = doctorService;
        this.departmentService = departmentService;
        this.medicalRecordService = medicalRecordService;
        this.notificationService = notificationService;
        this.hospitalService = hospitalService;
        this.paymentService = paymentService;
        this.patientHospitalRepository = patientHospitalRepository;
        this.recordSharingService = recordSharingService;
    }

    private Patient getCurrentPatient(UserDetails userDetails) {
        return patientService.findPatient(userDetails.getUsername());
    }

    // ---- DASHBOARD ----
    @GetMapping("/dashboard")
    public String dashboard(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        Patient patient = getCurrentPatient(userDetails);
        List<Appointment> appointments = appointmentService.findByPatient(patient);

        Appointment nextAppt = appointments.stream()
            .filter(a -> !a.getAppointmentDate().isBefore(java.time.LocalDate.now()))
            .filter(a -> a.getStatus() == AppointmentStatus.PENDING || a.getStatus() == AppointmentStatus.CONFIRMED)
            .findFirst().orElse(null);

        List<MedicalRecord> records = medicalRecordService.findByPatient(patient);

        model.addAttribute("patient", patient);
        model.addAttribute("nextAppointment", nextAppt);
        model.addAttribute("totalAppointments", appointments.size());
        model.addAttribute("recentRecord", records.isEmpty() ? null : records.get(0));
        model.addAttribute("unreadCount", notificationService.countUnread(patient));
        return "patient/dashboard";
    }

    // ---- DOCTORS ----
    @GetMapping("/doctors")
    public String doctors(@RequestParam(required = false) String search,
                           @RequestParam(required = false) Long departmentId, Model model) {
        List<Doctor> doctors;
        if (departmentId != null) {
            doctors = doctorService.findDoctorsByDepartment(departmentId);
        } else if (search != null && !search.isBlank()) {
            doctors = doctorService.searchDoctors(search);
        } else {
            doctors = doctorService.findAllDoctors();
        }
        model.addAttribute("doctors", doctors);
        model.addAttribute("departments", departmentService.findActiveDepartments());
        model.addAttribute("search", search);
        model.addAttribute("selectedDept", departmentId);
        return "patient/doctors";
    }

    // ---- BOOK APPOINTMENT ----
    @GetMapping("/book-appointment")
    public String bookAppointmentForm(@RequestParam(required = false) Long doctorId, Model model) {
        model.addAttribute("appointmentDto", new AppointmentBookingDto());
        model.addAttribute("doctors", doctorService.findAllDoctors());
        model.addAttribute("departments", departmentService.findActiveDepartments());
        model.addAttribute("timeSlots", AppConstants.MORNING_SLOTS);
        model.addAttribute("afternoonSlots", AppConstants.AFTERNOON_SLOTS);
        model.addAttribute("eveningSlots", AppConstants.EVENING_SLOTS);
        if (doctorId != null) {
            model.addAttribute("selectedDoctor", doctorService.findDoctor(doctorId));
            AppointmentBookingDto dto = new AppointmentBookingDto();
            dto.setDoctorId(doctorId);
            model.addAttribute("appointmentDto", dto);
        }
        return "patient/book-appointment";
    }

    @PostMapping("/book-appointment")
    public String bookAppointment(@Valid @ModelAttribute("appointmentDto") AppointmentBookingDto dto,
                                   BindingResult result,
                                   @AuthenticationPrincipal UserDetails userDetails,
                                   RedirectAttributes ra, Model model) {
        if (result.hasErrors()) {
            model.addAttribute("doctors", doctorService.findAllDoctors());
            model.addAttribute("departments", departmentService.findActiveDepartments());
            model.addAttribute("timeSlots", AppConstants.MORNING_SLOTS);
            model.addAttribute("afternoonSlots", AppConstants.AFTERNOON_SLOTS);
            model.addAttribute("eveningSlots", AppConstants.EVENING_SLOTS);
            return "patient/book-appointment";
        }
        try {
            Appointment appointment = appointmentService.bookAppointment(dto, userDetails.getUsername());
            ra.addFlashAttribute("success", "Appointment booked successfully! Consultation fee paid via UPI QR. Appointment ID: #" + appointment.getId());
            ra.addFlashAttribute("bookedAppointment", appointment);
            return "redirect:/patient/receipt/appointment/" + appointment.getId();
        } catch (Exception e) {
            model.addAttribute("error", e.getMessage());
            model.addAttribute("doctors", doctorService.findAllDoctors());
            model.addAttribute("departments", departmentService.findActiveDepartments());
            model.addAttribute("timeSlots", AppConstants.MORNING_SLOTS);
            model.addAttribute("afternoonSlots", AppConstants.AFTERNOON_SLOTS);
            model.addAttribute("eveningSlots", AppConstants.EVENING_SLOTS);
            return "patient/book-appointment";
        }
    }

    // ---- APPOINTMENTS ----
    @GetMapping("/appointments")
    public String appointments(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        Patient patient = getCurrentPatient(userDetails);
        model.addAttribute("patient", patient);
        model.addAttribute("appointments", appointmentService.findByPatient(patient));
        return "patient/appointments";
    }

    @PostMapping("/appointments/{id}/cancel")
    public String cancelAppointment(@PathVariable Long id, RedirectAttributes ra) {
        try {
            appointmentService.cancelAppointment(id);
            ra.addFlashAttribute("success", "Appointment cancelled successfully.");
        } catch (Exception e) {
            ra.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/patient/appointments";
    }

    // ---- MEDICAL RECORDS ----
    @GetMapping("/medical-records")
    public String medicalRecords(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        Patient patient = getCurrentPatient(userDetails);
        model.addAttribute("patient", patient);
        model.addAttribute("records", medicalRecordService.findByPatient(patient));
        return "patient/medical-records";
    }

    @GetMapping("/medical-records/{id}")
    public String viewRecord(@PathVariable Long id, Model model) {
        MedicalRecord record = medicalRecordService.findById(id);
        model.addAttribute("record", record);
        return "patient/medical-record-view";
    }

    // ---- PRESCRIPTIONS ----
    @GetMapping("/prescriptions")
    public String prescriptions(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        Patient patient = getCurrentPatient(userDetails);
        List<MedicalRecord> records = medicalRecordService.findByPatient(patient);
        model.addAttribute("patient", patient);
        model.addAttribute("records", records);
        return "patient/prescriptions";
    }

    // ---- PROFILE ----
    @GetMapping("/profile")
    public String profile(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        Patient patient = getCurrentPatient(userDetails);
        model.addAttribute("patient", patient);
        PatientRegistrationDto dto = new PatientRegistrationDto();
        dto.setName(patient.getName()); dto.setEmail(patient.getEmail());
        dto.setPhone(patient.getPhone()); dto.setAddress(patient.getAddress());
        dto.setDateOfBirth(patient.getDateOfBirth()); dto.setGender(patient.getGender());
        dto.setBloodGroup(patient.getBloodGroup());
        dto.setEmergencyContact(patient.getEmergencyContact());
        dto.setEmergencyContactName(patient.getEmergencyContactName());
        model.addAttribute("patientDto", dto);
        return "patient/profile";
    }

    @PostMapping("/profile/update")
    public String updateProfile(@Valid @ModelAttribute("patientDto") PatientRegistrationDto dto,
                                 BindingResult result,
                                 @AuthenticationPrincipal UserDetails userDetails,
                                 RedirectAttributes ra, Model model) {
        if (result.hasErrors()) {
            model.addAttribute("patient", getCurrentPatient(userDetails));
            return "patient/profile";
        }
        try {
            Patient patient = getCurrentPatient(userDetails);
            patientService.updatePatient(patient.getId(), dto);
            ra.addFlashAttribute("success", "Profile updated successfully.");
        } catch (Exception e) {
            ra.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/patient/profile";
    }

    // ---- NOTIFICATIONS ----
    @GetMapping("/notifications")
    public String notifications(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        Patient patient = getCurrentPatient(userDetails);
        model.addAttribute("notifications", notificationService.getNotificationsForUser(patient));
        notificationService.markAllAsRead(patient);
        return "patient/notifications";
    }

    // ---- MY HOSPITALS & MULTI-HOSPITAL REGISTRATION ----
    @GetMapping("/hospitals")
    public String myHospitals(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        Patient patient = getCurrentPatient(userDetails);
        List<PatientHospital> registeredHospitals = patientHospitalRepository.findByPatient(patient);
        List<Hospital> allHospitals = hospitalService.getActiveHospitals();

        model.addAttribute("patient", patient);
        model.addAttribute("registeredHospitals", registeredHospitals);
        model.addAttribute("allHospitals", allHospitals);
        return "patient/hospitals";
    }

    @PostMapping("/hospitals/{hospitalId}/register")
    public String registerWithHospital(@PathVariable("hospitalId") Long hospitalId,
                                       @RequestParam(value = "paymentMethod", defaultValue = "UPI") String paymentMethod,
                                       @AuthenticationPrincipal UserDetails userDetails,
                                       RedirectAttributes ra) {
        Patient patient = getCurrentPatient(userDetails);
        Hospital hospital = hospitalService.getHospitalById(hospitalId);

        // Check if already registered
        if (patientHospitalRepository.findByPatientAndHospital(patient, hospital).isPresent()) {
            ra.addFlashAttribute("info", "You are already registered with " + hospital.getHospitalName());
            return "redirect:/patient/hospitals";
        }

        // Process Registration Fee Payment
        Payment payment = paymentService.initiatePayment(
                patient, hospital, null,
                hospital.getRegistrationFee() != null ? hospital.getRegistrationFee() : new java.math.BigDecimal("250.00"),
                com.healix.hms.model.enums.PaymentType.REGISTRATION_FEE,
                paymentMethod
        );
        payment = paymentService.completePayment(payment.getPaymentReference());

        // Create PatientHospital junction record
        String hospitalPatientNumber = hospital.getHospitalCode() + "-P-" + String.format("%04d", patient.getId());
        PatientHospital ph = new PatientHospital(patient, hospital, hospitalPatientNumber);
        ph.setRegistrationSlipId(payment.getReceiptNumber());
        patientHospitalRepository.save(ph);

        // Send confirmation notification
        notificationService.sendNotification(
                patient,
                "Registered successfully with " + hospital.getHospitalName() + ". Hospital ID: " + hospitalPatientNumber,
                com.healix.hms.model.enums.NotificationType.PAYMENT,
                hospital.getId()
        );

        ra.addFlashAttribute("success", "Successfully registered with " + hospital.getHospitalName() + "!");
        return "redirect:/patient/receipt/" + payment.getPaymentReference();
    }

    // ---- REGISTRATION & PAYMENT RECEIPT ----
    @GetMapping("/receipt/{paymentReference}")
    public String viewPaymentReceipt(@PathVariable("paymentReference") String paymentReference,
                                     @AuthenticationPrincipal UserDetails userDetails,
                                     Model model) {
        Payment payment = paymentService.getPaymentByReference(paymentReference);
        Patient patient = getCurrentPatient(userDetails);
        PatientHospital ph = patientHospitalRepository.findByPatientAndHospital(patient, payment.getHospital()).orElse(null);

        model.addAttribute("payment", payment);
        model.addAttribute("patient", patient);
        model.addAttribute("hospital", payment.getHospital());
        model.addAttribute("patientHospital", ph);

        if (payment.getAppointmentId() != null || payment.getPaymentType() == com.healix.hms.model.enums.PaymentType.APPOINTMENT_FEE) {
            Appointment appt = null;
            if (payment.getAppointmentId() != null) {
                appt = appointmentService.findAppointment(payment.getAppointmentId());
            }
            model.addAttribute("appointment", appt);
            model.addAttribute("doctor", appt != null ? appt.getDoctor() : null);
            return "patient/appointment-receipt";
        }
        return "patient/payment-receipt";
    }

    @GetMapping({"/receipt/appointment/{id}", "/appointments/{id}/receipt"})
    public String viewAppointmentReceipt(@PathVariable("id") Long id,
                                         @AuthenticationPrincipal UserDetails userDetails,
                                         Model model) {
        Appointment appointment = appointmentService.findAppointment(id);
        Patient patient = getCurrentPatient(userDetails);
        Payment payment = appointment.getPayment();
        if (payment == null) {
            payment = paymentService.getPaymentByAppointmentId(appointment.getId());
        }
        model.addAttribute("appointment", appointment);
        model.addAttribute("doctor", appointment.getDoctor());
        model.addAttribute("hospital", appointment.getHospital() != null ? appointment.getHospital() : appointment.getDoctor().getHospital());
        model.addAttribute("patient", patient);
        model.addAttribute("payment", payment);
        return "patient/appointment-receipt";
    }

    @PostMapping("/appointments/{id}/pay")
    public String payAppointmentFee(@PathVariable("id") Long id,
                                    @RequestParam(value = "paymentMethod", defaultValue = "UPI_QR") String paymentMethod,
                                    @RequestParam(value = "transactionId", required = false) String transactionId,
                                    RedirectAttributes ra) {
        try {
            Payment payment = appointmentService.payAppointmentFee(id, paymentMethod, transactionId);
            ra.addFlashAttribute("success", "Consultation fee paid successfully! Receipt: " + payment.getReceiptNumber());
            return "redirect:/patient/receipt/appointment/" + id;
        } catch (Exception e) {
            ra.addFlashAttribute("error", "Payment failed: " + e.getMessage());
            return "redirect:/patient/appointments";
        }
    }

    // ---- AI HEALTH ASSISTANT ----
    @GetMapping("/ai-assistant")
    public String aiAssistantPage(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        Patient patient = getCurrentPatient(userDetails);
        model.addAttribute("patient", patient);
        model.addAttribute("hospitals", hospitalService.getActiveHospitals());
        return "patient/ai-assistant";
    }

    // ---- CROSS-HOSPITAL RECORD CONSENT ----
    @GetMapping("/consent-requests")
    public String consentRequestsPage(@AuthenticationPrincipal UserDetails userDetails, Model model) {
        Patient patient = getCurrentPatient(userDetails);
        model.addAttribute("pendingRequests", recordSharingService.getPendingRequestsForPatient(patient.getId()));
        model.addAttribute("allRequests", recordSharingService.getRequestsForPatient(patient.getId()));
        return "patient/consent-requests";
    }

    @PostMapping("/consent-requests/{requestId}/approve")
    public String approveConsent(@PathVariable("requestId") Long requestId,
                                 @RequestParam(value = "validDays", defaultValue = "7") int validDays,
                                 @AuthenticationPrincipal UserDetails userDetails,
                                 RedirectAttributes ra) {
        Patient patient = getCurrentPatient(userDetails);
        recordSharingService.approveRequest(requestId, patient.getId(), validDays);
        ra.addFlashAttribute("success", "Medical record access approved for " + validDays + " days.");
        return "redirect:/patient/consent-requests";
    }

    @PostMapping("/consent-requests/{requestId}/reject")
    public String rejectConsent(@PathVariable("requestId") Long requestId,
                                @AuthenticationPrincipal UserDetails userDetails,
                                RedirectAttributes ra) {
        Patient patient = getCurrentPatient(userDetails);
        recordSharingService.rejectRequest(requestId, patient.getId());
        ra.addFlashAttribute("info", "Record sharing request rejected.");
        return "redirect:/patient/consent-requests";
    }
}
