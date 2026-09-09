package com.healix.hms.repository;

import com.healix.hms.model.Appointment;
import com.healix.hms.model.Doctor;
import com.healix.hms.model.Patient;
import com.healix.hms.model.enums.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByPatient(Patient patient);
    List<Appointment> findByDoctor(Doctor doctor);
    List<Appointment> findByStatus(AppointmentStatus status);
    List<Appointment> findByAppointmentDate(LocalDate date);
    List<Appointment> findByDoctorAndAppointmentDate(Doctor doctor, LocalDate date);
    List<Appointment> findByPatientOrderByAppointmentDateDesc(Patient patient);
    List<Appointment> findByDoctorOrderByAppointmentDateAsc(Doctor doctor);

    // Conflict detection: check if doctor already has appointment at same date/time
    boolean existsByDoctorAndAppointmentDateAndAppointmentTimeAndStatusNot(
        Doctor doctor, LocalDate date, LocalTime time, AppointmentStatus status);

    // Check patient conflict
    boolean existsByPatientAndAppointmentDateAndAppointmentTimeAndStatusNot(
        Patient patient, LocalDate date, LocalTime time, AppointmentStatus status);

    List<Appointment> findByDoctorAndStatus(Doctor doctor, AppointmentStatus status);
    List<Appointment> findByPatientAndStatus(Patient patient, AppointmentStatus status);

    // Today's appointments for a doctor
    List<Appointment> findByDoctorAndAppointmentDateOrderByAppointmentTimeAsc(Doctor doctor, LocalDate date);

    long countByStatus(AppointmentStatus status);
    long countByAppointmentDate(LocalDate date);

    @Query("SELECT a FROM Appointment a WHERE a.appointmentDate >= :startDate AND a.appointmentDate <= :endDate ORDER BY a.appointmentDate ASC")
    List<Appointment> findByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.doctor = :doctor AND a.appointmentDate = :date AND a.status <> :cancelledStatus")
    long countDoctorAppointmentsOnDate(@Param("doctor") Doctor doctor,
                                      @Param("date") LocalDate date,
                                      @Param("cancelledStatus") AppointmentStatus cancelledStatus);
}
