package com.healix.hms.service;

import com.healix.hms.model.Department;

import java.util.List;

/**
 * DepartmentService interface - demonstrates ABSTRACTION and INTERFACE.
 */
public interface DepartmentService {
    Department createDepartment(Department department);
    Department updateDepartment(Long id, Department department);
    Department findById(Long id);
    Department findByName(String name);
    List<Department> findAllDepartments();
    List<Department> findActiveDepartments();
    void deleteDepartment(Long id);
    long countDepartments();
}
