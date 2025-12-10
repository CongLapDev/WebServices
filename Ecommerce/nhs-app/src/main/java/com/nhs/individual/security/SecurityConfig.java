package com.nhs.individual.security;

import com.nhs.individual.secure.IUserDetail;
import com.nhs.individual.security.Filter.JwtFilter;
import com.nhs.individual.security.Oauth2.Oauth2Service;
import com.nhs.individual.security.Oauth2.Oauth2SuccessHandler;
import com.nhs.individual.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true, securedEnabled = true, jsr250Enabled = true)
@Configuration
public class SecurityConfig {

    @Autowired
    private AccountService service;
    
    @Autowired
    private JwtFilter jwtFilter;
    
    @Autowired
    @Lazy
    private Oauth2Service oauth2Service;
    
    @Autowired
    @Lazy
    private Oauth2SuccessHandler oauth2SuccessHandler;

    @Bean
    public LogoutHandler logoutHandler() {
        return new LogoutHandlerCustomize();
    }

    @Bean
    public LogoutSuccessHandler logoutSuccessHandler() {
        return new LogoutSuccessHandlerCustomize();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity
                .cors(c -> c.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                // Add JWT filter BEFORE authentication checks
                // This ensures JWT tokens are processed and SecurityContext is set before Spring Security checks authentication
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .authorizeHttpRequests(req -> {
                    // Public endpoints - no authentication required
                    // OAuth2 endpoints (must be public for redirect flow)
                    req.requestMatchers("/oauth2/**").permitAll()
                    //upload endpoints
                    .requestMatchers("/uploads/**").permitAll()
                            // Login endpoints
                            .requestMatchers("/login/**").permitAll()
                            .requestMatchers("/api/auth/login").permitAll()
                            // Auth endpoints
                            .requestMatchers("/auth/**").permitAll()
                            // Error endpoints
                            .requestMatchers("/error").permitAll()
                            .requestMatchers("/error/**").permitAll()
                            // Other public endpoints
                            .requestMatchers("/register").permitAll()
                            .requestMatchers("/refresh").permitAll()
                            // Logout endpoints (both old and new)
                            .requestMatchers("/logout").permitAll()
                            .requestMatchers("/api/v1/auth/logout").permitAll()
                            .requestMatchers("/test/**").permitAll()
                            .requestMatchers("/swagger-ui/**").permitAll()
                            .requestMatchers("/v3/api-docs/**").permitAll()
                            // Public GET endpoints for products and categories
                            .requestMatchers(HttpMethod.GET, "/api/v1/product/**").permitAll()
                            .requestMatchers(HttpMethod.GET, "/api/v2/product/**").permitAll()
                            .requestMatchers(HttpMethod.GET, "/api/v1/category/**").permitAll()
                            .requestMatchers(HttpMethod.GET, "/api/v1/comment/**").permitAll()
                            // Stats and order endpoints explicitly require authentication (clarity)
                            .requestMatchers("/api/v1/statistic/**").authenticated()
                            .requestMatchers("/api/v1/order/**").authenticated()
                            .requestMatchers("/api/v1/order-management/**").authenticated()
                            .requestMatchers("/api/v1/orders/**").authenticated()
                            // All other requests require authentication
                            .anyRequest().authenticated();
                })
                .exceptionHandling(ex -> {
                    ex.authenticationEntryPoint(new RestAuthenticationEntryPoint());
                    ex.accessDeniedHandler(new RestAccessDeniedHandler());
                })
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .addLogoutHandler(logoutHandler())
                        .logoutSuccessHandler(logoutSuccessHandler())
                        .permitAll()
                        .clearAuthentication(true)
                        .invalidateHttpSession(false) // STATELESS - no session to invalidate
                )
                .oauth2Login(oauth2 -> oauth2
                        .loginPage("/oauth2/authorization/google")
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(oauth2Service))
                        .successHandler(oauth2SuccessHandler))
                .sessionManagement(manager -> manager.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        return httpSecurity.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> service.findByUsername(username)
                .map(IUserDetail::new)
                .orElseThrow(() -> new UsernameNotFoundException(username + " Not found"));
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        final DaoAuthenticationProvider authenticationProvider = new DaoAuthenticationProvider();
        authenticationProvider.setUserDetailsService(userDetailsService());
        authenticationProvider.setPasswordEncoder(passwordEncoder());
        return authenticationProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Explicitly allow localhost origins for development
        configuration.addAllowedOrigin("http://localhost:3000");
        configuration.addAllowedOrigin("http://localhost:8085");
        // Also allow all origins for flexibility (can be restricted in production)
        configuration.addAllowedOriginPattern("*");
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setAllowPrivateNetwork(true);
        configuration.setExposedHeaders(List.of("*"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
