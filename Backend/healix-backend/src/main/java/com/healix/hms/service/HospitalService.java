package com.healix.hms.service;

import com.healix.hms.model.Hospital;
import com.healix.hms.model.enums.HospitalStatus;

import java.util.List;

public interface HospitalService {
    Hospital createHospital(Hospital hospital);
    Hospital updateHospital(Long id, Hospital hospitalDetails);
    Hospital getHospitalById(Long id);
    Hospital getHospitalByCode(String code);
    List<Hospital> getAllHospitals();
    List<Hospital> getActiveHospitals();
    List<Hospital> getHospitalsByDistrict(String district);
    void updateHospitalStatus(Long id, HospitalStatus status);
    long countTotalHospitals();
    long countActiveHospitals();
}
