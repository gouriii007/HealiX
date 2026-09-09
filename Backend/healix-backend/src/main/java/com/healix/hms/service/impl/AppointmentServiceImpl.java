package com.healix.hms.service.impl;

import com.healix.hms.dto.AppointmentBookingDto;
import com.healix.hms.exception.*;
import com.healix.hms.model.*;
import com.healix.hms.model.enums.AppointmentStatus;
import com.healix.hms.repository.AppointmentRepository;
import com.healix.hms.service.AppointmentService;
import com.healix.hms.service.DoctorService;
import com.healix.hms.service.NotificationService;
import com.healix.hms.service.PatientService;
import com.healix.hms.model.enums.NotificationType;
import com.healix.hms.util.AppConstants;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * =====================================================================
 * AppointmentServiceImpl - core booking and conflict detection logic
 * =====================================================================
 * OOP / SOLID Concepts:
 *   - Implements AppointmentService interface
 *   - SRP: only manages appointment lifecycle
 *   - DIP: depends on service interfaces, not implementations
 *   - Uses AppConstants.MAX_APPOINTMENTS_PER_DAY (static final)
 * =====================================================================
 */
@Service
@Transactional
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientService patientService;
    private final DoctorService doctorService;
    private final NotificationService notificationService;

    public AppointmentServiceImpl(AppointmentRepository appointmentRepository,
                                   PatientService patientService,
                                   DoctorService doctorService,
                                   NotificationService notificationService) {
        this.appointmentRepository = appointmentRepository;
        this.patientService = patientService;
        this.doctorService = doctorService;
        this.notificationService = notificationService;
    }

    @Override
    public Appointment bookAppointment(AppointmentBookingDto dto, String patientEmail) {
        Patient patient = patientService.findPatient(patientEmail);
        Doctor doctor = doctorService.findDoctor(dto.getDoctorId());

        // Validate: appointment date cannot be in the past
        if (dto.getAppointmentDate().isBefore(LocalDate.now())) {
            throw new AppointmentConflictException("Appointment date cannot be in the past.");
        }

        // Validate: doctor conflict check
        if (hasConflict(doctor, dto.getAppointmentDate(), dto.getAppointmentTime(), null)) {
            throw new AppointmentConflictException(
                "Dr. " + doctor.getName() + " already has an appointment at " +
                dto.getAppointmentTime() + " on " + dto.getAppointmentDate() + ". Please select a different time slot.");
        }

        // Validate: patient conflict check
        if (appointmentRepository.existsByPatientAndAppointmentDateAndAppointmentTimeAndStatusNot(
                patient, dto.getAppointmentDate(), dto.getAppointmentTime(), AppointmentStatus.CANCELLED)) {
            throw new AppointmentConflictException("You already have an appointment at this time. Please select a different slot.");
        }

        // Validate: max appointments per day
        long doctorApptCount = appointmentRepository.countDoctorAppointmentsOnDate(
            doctor, dto.getAppointmentDate(), AppointmentStatus.CANCELLED);
        if (doctorApptCount >= AppConstants.MAX_APPOINTMENTS_PER_DAY) {
            throw new AppointmentConflictException(
                "Dr. " + doctor.getName() + " has reached the maximum appointments for " + dto.getAppointmentDate() + ".");
        }

        Appointment appointment = new Appointment(patient, doctor,
            dto.getAppointmentDate(), dto.getAppointmentTime(), dto.getReason());

        appointment = appointmentRepository.save(appointment);

        // Send notifications using Adapter pattern
        notificationService.sendNotification(patient, "Your appointment with Dr. " + doctor.getName() +
            " on " + dto.getAppointmentDate() + " at " + dto.getAppointmentTime() + " has been booked successfully.",
            NotificationType.APPOINTMENT_BOOKED);

        notificationService.sendNotification(doctor, "New appointment from " + patient.getName() +
            " on " + dto.getAppointmentDate() + " at " + dto.getAppointmentTime() + ".",
            NotificationType.APPOINTMENT_BOOKED);

        return appointment;
    }

    @Override
    public Appointment updateStatus(Long appointmentId, AppointmentStatus status) {
        Appointment appointment = findAppointment(appointmentId);
        AppointmentStatus oldStatus = appointment.getStatus();
        appointment.setStatus(status);
        appointment = appointmentRepository.save(appointment);

        // Notify patient
        String message = "Your appointment #" + appointment.getId() + " status has been updated to: " + status.name();
        NotificationType type = switch (status) {
            case CONFIRMED -> NotificationType.APPOINTMENT_CONFIRMED;
            case CANCELLED -> NotificationType.APPOINTMENT_CANCELLED;
            case COMPLETED -> NotificationType.APPOINTMENT_COMPLETED;
            case RESCHEDULED -> NotificationType.APPOINTMENT_RESCHEDULED;
            default -> NotificationType.GENERAL;
        };
        notificationService.sendNotification(appointment.getPatient(), message, type);

        return appointment;
    }

    @Override
    @Transactional(readOnly = true)
    public Appointment findAppointment(Long id) {
        return appointmentRepository.findById(id)
            .orElseThrow(() -> new AppointmentNotFoundException(id));
    }

    @Override
    public void cancelAppointment(Long id) {
        updateStatus(id, AppointmentStatus.CANCELLED);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Appointment> findAllAppointments() {
        return appointmentRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Appointment> findByPatient(Patient patient) {
        return appointmentRepository.findByPatientOrderByAppointmentDateDesc(patient);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Appointment> findByDoctor(Doctor doctor) {
        return appointmentRepository.findByDoctorOrderByAppointmentDateAsc(doctor);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Appointment> findByDate(LocalDate date) {
        return appointmentRepository.findByAppointmentDate(date);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Appointment> findByStatus(AppointmentStatus status) {
        return appointmentRepository.findByStatus(status);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Appointment> findTodaysAppointments(Doctor doctor) {
        return appointmentRepository.findByDoctorAndAppointmentDateOrderByAppointmentTimeAsc(
            doctor, LocalDate.now());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasConflict(Doctor doctor, LocalDate date, LocalTime time, Long excludeId) {
        return appointmentRepository.existsByDoctorAndAppointmentDateAndAppointmentTimeAndStatusNot(
            doctor, date, time, AppointmentStatus.CANCELLED);
    }

    @Override
    @Transactional(readOnly = true)
    public long countByStatus(AppointmentStatus status) {
        return appointmentRepository.countByStatus(status);
    }

    @Override
    @Transactional(readOnly = true)
    public long countTodaysAppointments() {
        return appointmentRepository.countByAppointmentDate(LocalDate.now());
    }
}
