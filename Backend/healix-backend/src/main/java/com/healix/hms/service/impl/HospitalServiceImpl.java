package com.healix.hms.service.impl;

import com.healix.hms.exception.HospitalNotFoundException;
import com.healix.hms.model.Hospital;
import com.healix.hms.model.enums.HospitalStatus;
import com.healix.hms.repository.HospitalRepository;
import com.healix.hms.service.HospitalService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class HospitalServiceImpl implements HospitalService {

    private final HospitalRepository hospitalRepository;

    public HospitalServiceImpl(HospitalRepository hospitalRepository) {
        this.hospitalRepository = hospitalRepository;
    }

    @Override
    public Hospital createHospital(Hospital hospital) {
        if (hospitalRepository.existsByHospitalCode(hospital.getHospitalCode())) {
            throw new IllegalArgumentException("Hospital code already exists: " + hospital.getHospitalCode());
        }
        return hospitalRepository.save(hospital);
    }

    @Override
    public Hospital updateHospital(Long id, Hospital hospitalDetails) {
        Hospital hospital = getHospitalById(id);
        hospital.setHospitalName(hospitalDetails.getHospitalName());
        hospital.setAddress(hospitalDetails.getAddress());
        hospital.setCity(hospitalDetails.getCity());
        hospital.setDistrict(hospitalDetails.getDistrict());
        hospital.setState(hospitalDetails.getState());
        hospital.setPincode(hospitalDetails.getPincode());
        hospital.setPhone(hospitalDetails.getPhone());
        hospital.setEmail(hospitalDetails.getEmail());
        hospital.setWebsite(hospitalDetails.getWebsite());
        hospital.setDescription(hospitalDetails.getDescription());
        hospital.setRegistrationFee(hospitalDetails.getRegistrationFee());
        if (hospitalDetails.getStatus() != null) {
            hospital.setStatus(hospitalDetails.getStatus());
        }
        return hospitalRepository.save(hospital);
    }

    @Override
    @Transactional(readOnly = true)
    public Hospital getHospitalById(Long id) {
        return hospitalRepository.findById(id)
                .orElseThrow(() -> new HospitalNotFoundException(id));
    }

    @Override
    @Transactional(readOnly = true)
    public Hospital getHospitalByCode(String code) {
        return hospitalRepository.findByHospitalCode(code)
                .orElseThrow(() -> new HospitalNotFoundException("Hospital not found with code: " + code));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Hospital> getAllHospitals() {
        return hospitalRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Hospital> getActiveHospitals() {
        return hospitalRepository.findByStatus(HospitalStatus.ACTIVE);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Hospital> getHospitalsByDistrict(String district) {
        return hospitalRepository.findByDistrictIgnoreCase(district);
    }

    @Override
    public void updateHospitalStatus(Long id, HospitalStatus status) {
        Hospital hospital = getHospitalById(id);
        hospital.setStatus(status);
        hospitalRepository.save(hospital);
    }

    @Override
    @Transactional(readOnly = true)
    public long countTotalHospitals() {
        return hospitalRepository.count();
    }

    @Override
    @Transactional(readOnly = true)
    public long countActiveHospitals() {
        return hospitalRepository.findByStatus(HospitalStatus.ACTIVE).size();
    }
}
