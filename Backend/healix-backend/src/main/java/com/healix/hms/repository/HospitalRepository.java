package com.healix.hms.repository;

import com.healix.hms.model.Hospital;
import com.healix.hms.model.enums.HospitalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HospitalRepository extends JpaRepository<Hospital, Long> {
    Optional<Hospital> findByHospitalCode(String hospitalCode);
    List<Hospital> findByStatus(HospitalStatus status);
    List<Hospital> findByCityIgnoreCase(String city);
    List<Hospital> findByDistrictIgnoreCase(String district);
    boolean existsByHospitalCode(String hospitalCode);
}
