package com.modeldock.service;

import com.modeldock.dto.AuthRequest;
import com.modeldock.dto.AuthResponse;
import com.modeldock.dto.RegisterRequest;
import com.modeldock.dto.UserDto;
import com.modeldock.model.Role;
import com.modeldock.model.User;
import com.modeldock.repository.UserRepository;
import com.modeldock.security.JwtTokenProvider;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository, 
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager, 
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    @PostConstruct
    public void seedDefaultUsers() {
        if (userRepository.count() > 0) return;

        log.info("Seeding default ModelDock role-based users...");

        // Admin
        User admin = new User("admin", "admin@modeldock.io", passwordEncoder.encode("admin123"), Role.ROLE_ADMIN);
        // Developer
        User dev = new User("developer", "dev@modeldock.io", passwordEncoder.encode("dev123"), Role.ROLE_DEVELOPER);
        // Viewer
        User viewer = new User("viewer", "viewer@modeldock.io", passwordEncoder.encode("viewer123"), Role.ROLE_VIEWER);

        userRepository.save(admin);
        userRepository.save(dev);
        userRepository.save(viewer);

        log.info("Default users seeded: admin@modeldock.io, dev@modeldock.io, viewer@modeldock.io");
    }

    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByUsername(request.getUsername())
                .or(() -> userRepository.findByEmail(request.getUsername()))
                .orElseThrow(() -> new IllegalArgumentException("Invalid user credentials"));

        String token = tokenProvider.generateToken(authentication, user);

        return new AuthResponse(token, user.getId(), user.getUsername(), user.getEmail(), user.getRole());
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username '" + request.getUsername() + "' is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email '" + request.getEmail() + "' is already registered");
        }

        Role assignedRole = request.getRole() != null ? request.getRole() : Role.ROLE_DEVELOPER;

        User user = new User(
                request.getUsername(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                assignedRole
        );

        user = userRepository.save(user);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        String token = tokenProvider.generateToken(authentication, user);

        return new AuthResponse(token, user.getId(), user.getUsername(), user.getEmail(), user.getRole());
    }

    public UserDto getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
        return new UserDto(user);
    }
}
