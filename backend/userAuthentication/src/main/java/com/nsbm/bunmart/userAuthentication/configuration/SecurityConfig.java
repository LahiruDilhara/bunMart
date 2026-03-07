package com.nsbm.bunmart.userAuthentication.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints - no token needed
                        .requestMatchers("/api/v1/auth/signup", "/api/v1/auth/signin", "/api/v1/auth/logout").permitAll()
                        // Profile by userId (e.g. frontend sends ?userId=1) - no token needed
                        .requestMatchers(HttpMethod.GET, "/api/v1/users/profile").permitAll()
                        // Admin-only: list users, stats, block/unblock
                        .requestMatchers(HttpMethod.GET, "/api/v1/users/list", "/api/v1/users/stats").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/users/*/blocked").hasRole("ADMIN")
                        // Everything else needs a valid token
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
