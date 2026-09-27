package com.healix.hms.controller;

import com.healix.hms.model.*;
import com.healix.hms.model.enums.AppointmentStatus;
import com.healix.hms.repository.*;
import com.healix.hms.security.HospitalSecurityService;
import com.healix.hms.service.AuditLogService;
import com.healix.hms.service.HospitalService;
import com.healix.hms.service.PaymentService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Controller
@RequestMapping("/hospital-admin")
@PreAuthorize("hasAnyRole('HOSPITAL_ADMIN', 'ADMIN', 'SUPER_ADMIN')")
public class HospitalAdminController {

    private final HospitalSecurityService hospitalSecurityService;
    private final HospitalService hospitalService;
    private final DoctorRepository doctorRepository;
    private final DepartmentRepository departmentRepository;
    private final AppointmentRepository appointmentRepository;
    private final PatientHospitalRepository patientHospitalRepository;
    private final PaymentService paymentService;
    private final AuditLogService auditLogService;

    public HospitalAdminController(HospitalSecurityService hospitalSecurityService,
                                   HospitalService hospitalService,
                                   DoctorRepository doctorRepository,
                                   DepartmentRepository departmentRepository,
                                   AppointmentRepository appointmentRepository,
                                   PatientHospitalRepository patientHospitalRepository,
                                   PaymentService paymentService,
                                   AuditLogService auditLogService) {
        this.hospitalSecurityService = hospitalSecurityService;
        this.hospitalService = hospitalService;
        this.doctorRepository = doctorRepository;
        this.departmentRepository = departmentRepository;
        this.appointmentRepository = appointmentRepository;
        this.patientHospitalRepository = patientHospitalRepository;
        this.paymentService = paymentService;
        this.auditLogService = auditLogService;
    }

    @GetMapping("/dashboard")
    public String dashboard(@RequestParam(value = "hospitalId", required = false) Long hospitalIdParam,
                            Model model) {
        Long hospitalId = hospitalSecurityService.getCurrentHospitalId();
        if (hospitalId == null) {
            hospitalId = hospitalIdParam != null ? hospitalIdParam : 1L;
        }

        Hospital hospital = hospitalService.getHospitalById(hospitalId);
        long doctorCount = doctorRepository.countByHospitalId(hospitalId);
        long patientCount = patientHospitalRepository.countByHospitalId(hospitalId);
        long todayAppointments = appointmentRepository.countByHospitalIdAndAppointmentDate(hospitalId, LocalDate.now());
        long pendingAppointments = appointmentRepository.countByHospitalIdAndStatus(hospitalId, AppointmentStatus.PENDING);
        BigDecimal todayRevenue = paymentService.calculateTodayRevenue(hospitalId);
        BigDecimal registrationRevenue = paymentService.calculateRegistrationRevenue(hospitalId);
        BigDecimal totalRevenue = paymentService.calculateTotalRevenue(hospitalId);

        List<Appointment> recentAppointments = appointmentRepository.findByHospitalIdOrderByAppointmentDateDesc(hospitalId);
        if (recentAppointments.size() > 10) {
            recentAppointments = recentAppointments.subList(0, 10);
        }

        model.addAttribute("hospital", hospital);
        model.addAttribute("doctorCount", doctorCount);
        model.addAttribute("patientCount", patientCount);
        model.addAttribute("todayAppointments", todayAppointments);
        model.addAttribute("pendingAppointments", pendingAppointments);
        model.addAttribute("todayRevenue", todayRevenue);
        model.addAttribute("registrationRevenue", registrationRevenue);
        model.addAttribute("totalRevenue", totalRevenue);
        model.addAttribute("recentAppointments", recentAppointments);
        return "hospital-admin/dashboard";
    }

    @GetMapping("/doctors")
    public String doctorsList(Model model) {
        Long hospitalId = hospitalSecurityService.getCurrentHospitalId();
        if (hospitalId == null) hospitalId = 1L;
        model.addAttribute("hospital", hospitalService.getHospitalById(hospitalId));
        model.addAttribute("doctors", doctorRepository.findByHospitalId(hospitalId));
        return "hospital-admin/doctors";
    }

    @GetMapping("/departments")
    public String departmentsList(Model model) {
        Long hospitalId = hospitalSecurityService.getCurrentHospitalId();
        if (hospitalId == null) hospitalId = 1L;
        model.addAttribute("hospital", hospitalService.getHospitalById(hospitalId));
        model.addAttribute("departments", departmentRepository.findByHospitalId(hospitalId));
        return "hospital-admin/departments";
    }

    @GetMapping("/patients")
    public String hospitalPatients(Model model) {
        Long hospitalId = hospitalSecurityService.getCurrentHospitalId();
        if (hospitalId == null) hospitalId = 1L;
        model.addAttribute("hospital", hospitalService.getHospitalById(hospitalId));
        model.addAttribute("patientHospitals", patientHospitalRepository.findByHospitalId(hospitalId));
        return "hospital-admin/patients";
    }

    @GetMapping("/payments")
    public String paymentsList(Model model) {
        Long hospitalId = hospitalSecurityService.getCurrentHospitalId();
        if (hospitalId == null) hospitalId = 1L;
        model.addAttribute("hospital", hospitalService.getHospitalById(hospitalId));
        model.addAttribute("payments", paymentService.getPaymentsByHospital(hospitalId));
        return "hospital-admin/payments";
    }

    @GetMapping({"/receipt/{paymentReference}", "/appointments/{id}/receipt"})
    public String viewReceipt(@PathVariable(value = "paymentReference", required = false) String paymentReference,
                              @PathVariable(value = "id", required = false) Long appointmentId,
                              Model model) {
        Payment payment = null;
        Appointment appointment = null;
        if (appointmentId != null) {
            appointment = appointmentRepository.findById(appointmentId).orElse(null);
            if (appointment != null) {
                payment = appointment.getPayment() != null ? appointment.getPayment() : paymentService.getPaymentByAppointmentId(appointmentId);
            }
        } else if (paymentReference != null) {
            payment = paymentService.getPaymentByReference(paymentReference);
            if (payment != null && payment.getAppointmentId() != null) {
                appointment = appointmentRepository.findById(payment.getAppointmentId()).orElse(null);
            }
        }

        if (payment == null && appointment == null) {
            return "redirect:/hospital-admin/dashboard";
        }

        Hospital hospital = payment != null ? payment.getHospital() : appointment.getHospital();
        Patient patient = payment != null ? payment.getPatient() : appointment.getPatient();
        Doctor doctor = appointment != null ? appointment.getDoctor() : null;

        model.addAttribute("payment", payment);
        model.addAttribute("patient", patient);
        model.addAttribute("hospital", hospital);
        model.addAttribute("doctor", doctor);
        model.addAttribute("appointment", appointment);

        if (appointment != null || (payment != null && payment.getPaymentType() == com.healix.hms.model.enums.PaymentType.APPOINTMENT_FEE)) {
            return "patient/appointment-receipt";
        }
        return "patient/payment-receipt";
    }
}
