package com.healix.hms.service.impl;

import com.healix.hms.exception.DepartmentNotFoundException;
import com.healix.hms.model.Department;
import com.healix.hms.repository.DepartmentRepository;
import com.healix.hms.service.DepartmentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentServiceImpl(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    @Override
    public Department createDepartment(Department department) {
        if (departmentRepository.existsByName(department.getName())) {
            throw new IllegalArgumentException("Department '" + department.getName() + "' already exists.");
        }
        return departmentRepository.save(department);
    }

    @Override
    public Department updateDepartment(Long id, Department updated) {
        Department department = findById(id);
        department.setName(updated.getName());
        department.setDescription(updated.getDescription());
        department.setIconClass(updated.getIconClass());
        return departmentRepository.save(department);
    }

    @Override
    @Transactional(readOnly = true)
    public Department findById(Long id) {
        return departmentRepository.findById(id)
            .orElseThrow(() -> new DepartmentNotFoundException(id));
    }

    @Override
    @Transactional(readOnly = true)
    public Department findByName(String name) {
        return departmentRepository.findByName(name)
            .orElseThrow(() -> new DepartmentNotFoundException(name));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Department> findAllDepartments() {
        return departmentRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Department> findActiveDepartments() {
        return departmentRepository.findByActiveTrue();
    }

    @Override
    public void deleteDepartment(Long id) {
        Department department = findById(id);
        department.setActive(false);
        departmentRepository.save(department);
    }

    @Override
    @Transactional(readOnly = true)
    public long countDepartments() {
        return departmentRepository.countByActiveTrue();
    }
}
