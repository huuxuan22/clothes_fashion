package com.example.projectc1023i1.service;

import com.example.projectc1023i1.component.JwtTokenUtils;
import com.example.projectc1023i1.model.Users;
import com.example.projectc1023i1.request.LoginRequest;
import com.example.projectc1023i1.respone.LoginResponse;
import com.example.projectc1023i1.respone.UserRespone;
import com.example.projectc1023i1.service.impl.IUserService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

/**
 * Service layer cho authentication logic
 * 
 * Tuân thủ Single Responsibility Principle:
 * - Chỉ xử lý authentication và token generation
 */
@Service
public class AuthService {
    
    private final AuthenticationManager authenticationManager;
    private final JwtTokenUtils jwtTokenUtils;
    private final IUserService userService;
    
    public AuthService(
            AuthenticationManager authenticationManager,
            JwtTokenUtils jwtTokenUtils,
            IUserService userService
    ) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenUtils = jwtTokenUtils;
        this.userService = userService;
    }
    
    /**
     * Authenticate user và generate token cùng với user info
     * 
     * @param loginRequest Login request từ client
     * @return LoginResponse chứa token và user info
     * @throws BadCredentialsException nếu credentials không đúng
     */
    public LoginResponse authenticate(LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );
            
            Users user = (Users) authentication.getPrincipal();
            String token = jwtTokenUtils.generateToken(user);
            
            // Convert Users entity to UserRespone
            UserRespone userRespone = userService.convertUserToUserRespone(user);
            
            return LoginResponse.builder()
                    .token(token)
                    .user(userRespone)
                    .build();
            
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Tài khoản không tồn tại hoặc mật khẩu không đúng.", e);
        }
    }
}

