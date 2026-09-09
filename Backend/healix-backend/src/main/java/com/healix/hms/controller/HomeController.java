package com.healix.hms.controller;

import com.healix.hms.service.DepartmentService;
import com.healix.hms.service.DoctorService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * HomeController - serves public landing page.
 * SRP: only handles public-facing, unauthenticated requests.
 */
@Controller
public class HomeController {

    private final DoctorService doctorService;
    private final DepartmentService departmentService;

    public HomeController(DoctorService doctorService, DepartmentService departmentService) {
        this.doctorService = doctorService;
        this.departmentService = departmentService;
    }

    @GetMapping("/")
    public String home(Model model) {
        model.addAttribute("departments", departmentService.findActiveDepartments());
        model.addAttribute("doctors", doctorService.findAllDoctors());
        return "index";
    }

    @GetMapping("/access-denied")
    public String accessDenied() {
        return "error/access-denied";
    }
}
