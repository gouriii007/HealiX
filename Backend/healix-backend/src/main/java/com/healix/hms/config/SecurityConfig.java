package com.healix.hms.config;

import com.healix.hms.security.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

/**
 * =====================================================================
 * SecurityConfig - Spring Security configuration for Healix HMS
 * =====================================================================
 * Security Features:
 *   - BCrypt password hashing (never plain text)
 *   - Role-based URL access control
 *   - Custom login/logout pages
 *   - CSRF protection (enabled by default)
 *   - Session management
 *
 * SOLID DIP: Depends on abstractions (UserDetailsService, PasswordEncoder)
 * =====================================================================
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;

    public SecurityConfig(CustomUserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    /**
     * BCrypt password encoder - strong hashing for stored passwords.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.ignoringRequestMatchers("/api/**"))
            .authenticationProvider(authenticationProvider())
            .authorizeHttpRequests(auth -> auth
                // Public pages - accessible without login
                .requestMatchers("/", "/login", "/register", "/access-denied", "/hospitals/**", "/api/ai/**", "/auth/otp/**", "/auth/forgot-password/**", "/css/**", "/js/**", "/images/**", "/error/**").permitAll()
                // Super Admin pages
                .requestMatchers("/super-admin/**").hasAnyRole("SUPER_ADMIN", "ADMIN")
                // Hospital Admin pages
                .requestMatchers("/hospital-admin/**").hasAnyRole("HOSPITAL_ADMIN", "ADMIN", "SUPER_ADMIN")
                // General Admin-only pages
                .requestMatchers("/admin/**").hasAnyRole("ADMIN", "SUPER_ADMIN", "HOSPITAL_ADMIN")
                // Doctor-only pages
                .requestMatchers("/doctor/**").hasRole("DOCTOR")
                // Patient-only pages
                .requestMatchers("/patient/**").hasRole("PATIENT")
                // Receptionist pages
                .requestMatchers("/receptionist/**").hasAnyRole("RECEPTIONIST", "HOSPITAL_ADMIN")
                // All other requests require authentication
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/login")
                .loginProcessingUrl("/login")
                .usernameParameter("email")
                .passwordParameter("password")
                // Redirect to role-specific dashboard after login
                .successHandler(new com.healix.hms.security.CustomAuthSuccessHandler())
                .failureUrl("/login?error=true")
                .permitAll()
            )
            .logout(logout -> logout
                .logoutRequestMatcher(new AntPathRequestMatcher("/logout"))
                .logoutSuccessUrl("/login?logout=true")
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
                .permitAll()
            )
            .sessionManagement(session -> session
                .maximumSessions(1)
                .expiredUrl("/login?expired=true")
            )
            .exceptionHandling(ex -> ex
                .accessDeniedPage("/access-denied")
            );

        return http.build();
    }
}
