package com.healix.hms.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

import java.io.IOException;
import java.util.Collection;

/**
 * CustomAuthSuccessHandler - redirects users to role-specific dashboards after login.
 * Demonstrates polymorphism: implements AuthenticationSuccessHandler interface.
 */
public class CustomAuthSuccessHandler implements AuthenticationSuccessHandler {

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                         HttpServletResponse response,
                                         Authentication authentication) throws IOException {

        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        String redirectUrl = "/login"; // fallback

        for (GrantedAuthority authority : authorities) {
            String role = authority.getAuthority();
            redirectUrl = switch (role) {
                case "ROLE_ADMIN" -> "/admin/dashboard";
                case "ROLE_DOCTOR" -> "/doctor/dashboard";
                case "ROLE_PATIENT" -> "/patient/dashboard";
                default -> "/login";
            };
            break; // only first role
        }

        response.sendRedirect(request.getContextPath() + redirectUrl);
    }
}
