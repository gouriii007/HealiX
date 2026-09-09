package com.healix.hms.repository;

import com.healix.hms.model.User;
import com.healix.hms.model.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * UserRepository - data access layer for User entities.
 * Spring Data JPA auto-implements these methods at runtime.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRole(Role role);
    List<User> findByActiveTrue();
}
