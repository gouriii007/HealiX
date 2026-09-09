package com.healix.hms.service;

import com.healix.hms.dto.AppointmentBookingDto;
import com.healix.hms.model.Appointment;
import com.healix.hms.model.Doctor;
import com.healix.hms.model.Patient;
import com.healix.hms.model.enums.AppointmentStatus;

import java.time.LocalDate;
import java.util.List;

/**
 * AppointmentService interface - core booking logic contract.
 * Demonstrates ABSTRACTION, INTERFACE, and SOLID ISP.
 */
public interface AppointmentService {

    Appointment bookAppointment(AppointmentBookingDto dto, String patientEmail);
    Appointment updateStatus(Long appointmentId, AppointmentStatus status);
    Appointment findAppointment(Long id);
    void cancelAppointment(Long id);

    List<Appointment> findAllAppointments();
    List<Appointment> findByPatient(Patient patient);
    List<Appointment> findByDoctor(Doctor doctor);
    List<Appointment> findByDate(LocalDate date);
    List<Appointment> findByStatus(AppointmentStatus status);
    List<Appointment> findTodaysAppointments(Doctor doctor);

    // Conflict detection
    boolean hasConflict(Doctor doctor, LocalDate date, java.time.LocalTime time, Long excludeId);

    long countByStatus(AppointmentStatus status);
    long countTodaysAppointments();
}
