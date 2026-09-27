package com.healix.hms.service.impl;

import com.healix.hms.dto.MedicalRecordDto;
import com.healix.hms.exception.AppointmentNotFoundException;
import com.healix.hms.exception.MedicalRecordNotFoundException;
import com.healix.hms.model.*;
import com.healix.hms.repository.AppointmentRepository;
import com.healix.hms.repository.MedicalRecordRepository;
import com.healix.hms.repository.PrescriptionRepository;
import com.healix.hms.service.DoctorService;
import com.healix.hms.service.MedicalRecordService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class MedicalRecordServiceImpl implements MedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final AppointmentRepository appointmentRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final DoctorService doctorService;

    public MedicalRecordServiceImpl(MedicalRecordRepository medicalRecordRepository,
                                     AppointmentRepository appointmentRepository,
                                     PrescriptionRepository prescriptionRepository,
                                     DoctorService doctorService) {
        this.medicalRecordRepository = medicalRecordRepository;
        this.appointmentRepository = appointmentRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.doctorService = doctorService;
    }

    @Override
    public MedicalRecord createMedicalRecord(MedicalRecordDto dto, Long appointmentId, String doctorEmail) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> new AppointmentNotFoundException(appointmentId));

        Doctor doctor = doctorService.findDoctor(doctorEmail);

        MedicalRecord record = new MedicalRecord(appointment, appointment.getPatient(), doctor);
        if (appointment.getHospital() != null) {
            record.setHospital(appointment.getHospital());
        } else if (doctor.getHospital() != null) {
            record.setHospital(doctor.getHospital());
        }
        record.setSymptoms(dto.getSymptoms());
        record.setDiagnosis(dto.getDiagnosis());
        record.setTreatment(dto.getTreatment());
        record.setNotes(dto.getNotes());
        record.setFollowUpDate(dto.getFollowUpDate());

        record = medicalRecordRepository.save(record);

        // Add prescriptions
        if (dto.getPrescriptions() != null) {
            List<Prescription> prescriptions = new ArrayList<>();
            for (MedicalRecordDto.PrescriptionDto prescDto : dto.getPrescriptions()) {
                if (prescDto.getMedicineName() != null && !prescDto.getMedicineName().isBlank()) {
                    Prescription prescription = new Prescription(record,
                        prescDto.getMedicineName(), prescDto.getDosage(),
                        prescDto.getFrequency(), prescDto.getDuration());
                    prescription.setInstructions(prescDto.getInstructions());
                    prescription.setPrescriptionCode("RX-TRV-" + String.format("%06d", (long)(Math.random() * 900000 + 100000)));
                    prescriptions.add(prescription);
                }
            }
            if (!prescriptions.isEmpty()) {
                prescriptionRepository.saveAll(prescriptions);
                record.setPrescriptions(prescriptions);
            }
        }

        return record;
    }

    @Override
    public MedicalRecord updateMedicalRecord(Long id, MedicalRecordDto dto) {
        MedicalRecord record = findById(id);
        record.setSymptoms(dto.getSymptoms());
        record.setDiagnosis(dto.getDiagnosis());
        record.setTreatment(dto.getTreatment());
        record.setNotes(dto.getNotes());
        record.setFollowUpDate(dto.getFollowUpDate());
        return medicalRecordRepository.save(record);
    }

    @Override
    @Transactional(readOnly = true)
    public MedicalRecord findById(Long id) {
        return medicalRecordRepository.findById(id)
            .orElseThrow(() -> new MedicalRecordNotFoundException(id));
    }

    @Override
    @Transactional(readOnly = true)
    public MedicalRecord findByAppointmentId(Long appointmentId) {
        return medicalRecordRepository.findByAppointmentId(appointmentId)
            .orElseThrow(() -> new MedicalRecordNotFoundException(appointmentId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicalRecord> findByPatient(Patient patient) {
        return medicalRecordRepository.findByPatientOrderByCreatedAtDesc(patient);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicalRecord> findByPatientId(Long patientId) {
        return medicalRecordRepository.findAll().stream()
            .filter(r -> r.getPatient().getId().equals(patientId))
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsForAppointment(Long appointmentId) {
        return medicalRecordRepository.existsByAppointmentId(appointmentId);
    }
}
