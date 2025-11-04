package com.example.projectc1023i1.service;

import com.example.projectc1023i1.component.JwtTokenUtils;
import com.example.projectc1023i1.model.Users;
import com.example.projectc1023i1.request.LoginRequest;
import com.example.projectc1023i1.respone.errorsValidate.LoginErrors;
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
    
    public AuthService(
            AuthenticationManager authenticationManager,
            JwtTokenUtils jwtTokenUtils
    ) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenUtils = jwtTokenUtils;
    }
    
    /**
     * Authenticate user và generate token
     * 
     * @param loginRequest Login request từ client
     * @return JWT token
     * @throws BadCredentialsException nếu credentials không đúng
     */
    public String authenticate(LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );
            
            Users user = (Users) authentication.getPrincipal();

            return jwtTokenUtils.generateToken(user);
            
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Tài khoản hoặc mật khẩu không đúng.", e);
        }
    }
}

