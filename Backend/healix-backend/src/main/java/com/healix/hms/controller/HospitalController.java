package com.healix.hms.controller;

import com.healix.hms.model.Hospital;
import com.healix.hms.model.enums.HospitalStatus;
import com.healix.hms.service.DepartmentService;
import com.healix.hms.service.DoctorService;
import com.healix.hms.service.HospitalService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Controller
@RequestMapping("/hospitals")
public class HospitalController {

    private final HospitalService hospitalService;
    private final DepartmentService departmentService;
    private final DoctorService doctorService;

    public HospitalController(HospitalService hospitalService,
                              DepartmentService departmentService,
                              DoctorService doctorService) {
        this.hospitalService = hospitalService;
        this.departmentService = departmentService;
        this.doctorService = doctorService;
    }

    @GetMapping
    public String listHospitals(@RequestParam(value = "district", required = false) String district,
                                @RequestParam(value = "query", required = false) String query,
                                Model model) {
        List<Hospital> hospitals;
        if (district != null && !district.trim().isEmpty()) {
            hospitals = hospitalService.getHospitalsByDistrict(district);
        } else {
            hospitals = hospitalService.getActiveHospitals();
        }

        if (query != null && !query.trim().isEmpty()) {
            String lowerQuery = query.toLowerCase();
            hospitals = hospitals.stream()
                    .filter(h -> h.getHospitalName().toLowerCase().contains(lowerQuery) ||
                                 (h.getDescription() != null && h.getDescription().toLowerCase().contains(lowerQuery)) ||
                                 (h.getCity() != null && h.getCity().toLowerCase().contains(lowerQuery)))
                    .toList();
        }

        model.addAttribute("hospitals", hospitals);
        model.addAttribute("selectedDistrict", district);
        model.addAttribute("searchQuery", query);
        return "hospitals/list";
    }

    @GetMapping("/{id}")
    public String viewHospitalDetails(@PathVariable("id") Long id, Model model) {
        Hospital hospital = hospitalService.getHospitalById(id);
        model.addAttribute("hospital", hospital);
        model.addAttribute("departments", hospital.getDepartments());
        return "hospitals/view";
    }
}
