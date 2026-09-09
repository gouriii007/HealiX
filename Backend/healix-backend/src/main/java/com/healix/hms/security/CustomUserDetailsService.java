package com.healix.hms.security;

import com.healix.hms.model.User;
import com.healix.hms.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

/**
 * CustomUserDetailsService - loads user from DB for Spring Security.
 * Demonstrates DIP: Spring Security depends on UserDetailsService abstraction,
 * not on our concrete User class.
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    // Constructor injection - demonstrates Dependency Inversion Principle
    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("No user found with email: " + email));

        if (!user.isActive()) {
            throw new UsernameNotFoundException("User account is deactivated: " + email);
        }

        return new org.springframework.security.core.userdetails.User(
            user.getEmail(),
            user.getPassword(),
            Collections.singletonList(new SimpleGrantedAuthority(user.getRole().name()))
        );
    }
}
