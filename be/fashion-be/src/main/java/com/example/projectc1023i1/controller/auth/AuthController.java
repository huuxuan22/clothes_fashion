package com.example.projectc1023i1.controller.auth;

import com.example.projectc1023i1.Dto.UserDTO;
import com.example.projectc1023i1.Exception.UserExepion;
import com.example.projectc1023i1.component.JwtTokenUtils;
import com.example.projectc1023i1.model.Roles;
import com.example.projectc1023i1.model.Users;
import com.example.projectc1023i1.request.LoginRequest;
import com.example.projectc1023i1.respone.LoginResponse;
import com.example.projectc1023i1.respone.errorsValidate.LoginErrors;
import com.example.projectc1023i1.respone.errorsValidate.RegisterErrors;
import com.example.projectc1023i1.service.AuthService;
import com.example.projectc1023i1.service.LocaleService;
import com.example.projectc1023i1.service.RedisService;
import com.example.projectc1023i1.mapper.ValidationErrorMapper;
import com.example.projectc1023i1.service.VerificationService;
import com.example.projectc1023i1.service.impl.IUserService;
import com.example.projectc1023i1.utils.GetTokenFromRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.Locale;

@RestController
@AllArgsConstructor
@RequestMapping("/api")
public class AuthController {
    
    private final AuthService authService;
    private final ValidationErrorMapper validationErrorMapper;
    private final JwtTokenUtils jwtTokenUtils;
    private final RedisService redisService;
    private final IUserService userService;
    private final VerificationService verificationService;
    private final AuthenticationManager authenticationManager;
    private final MessageSource messageSource;
    private final LocaleService localeService;
    
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest loginRequest,
            BindingResult bindingResult
    ) {
        if (bindingResult.hasErrors()) {
            LoginErrors loginErrors = validationErrorMapper.mapToLoginErrors(bindingResult);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(loginErrors);
        }
        
        LoginResponse loginResponse = authService.authenticate(loginRequest);
        return ResponseEntity.ok(loginResponse);
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            @AuthenticationPrincipal Users user,
            HttpServletRequest request
    ) {
        Locale locale = localeService.getLocale(request);
        String token = GetTokenFromRequest.getTokenFromRequest(request);
        if (token != null) {
            String username = jwtTokenUtils.extractUserName(token);
            redisService.addTokenList(username, token);
            String message = messageSource.getMessage("auth.logout.success", null, locale);
            return ResponseEntity.ok(message);
        } else {
            String message = messageSource.getMessage("auth.logout.token.not.found", null, locale);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(message);
        }
    }
    
    @PutMapping("/register")
    public ResponseEntity<?> register(
            @Valid @RequestBody UserDTO userDTO,
            BindingResult bindingResult,
            HttpServletRequest request
    ) throws UserExepion {
        Locale locale = localeService.getLocale(request);
        if (bindingResult.hasErrors()) {
            RegisterErrors registerErrors = validationErrorMapper.mapToRegisterErrors(bindingResult);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(registerErrors);
        }
        
        // Gửi mã xác thực và lưu UserDTO vào Redis
        verificationService.sendVerificationCode(userDTO);
        String message = messageSource.getMessage("auth.register.verification.sent", 
                new Object[]{userDTO.getEmail()}, locale);
        return ResponseEntity.ok(message);
    }
    
    @PostMapping("/send-again")
    public ResponseEntity<?> sendCodeAgain(
            @RequestParam String email,
            HttpServletRequest request
    ) {
        Locale locale = localeService.getLocale(request);
        UserDTO userDTO = verificationService.getUserDTOFromRedis(email);
        
        if (userDTO == null) {
            String message = messageSource.getMessage("auth.register.data.not.found", null, locale);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(message);
        }
        
        try {
            verificationService.sendVerificationCode(userDTO);
            String message = messageSource.getMessage("auth.register.send.again.success", 
                    new Object[]{email}, locale);
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            String message = messageSource.getMessage("auth.register.send.again.error", 
                    new Object[]{e.getMessage()}, locale);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(message);
        }
    }
    
    @PostMapping("/save")
    public ResponseEntity<?> verifyCodeAndSave(
            @RequestParam String email,
            @RequestParam String code,
            HttpServletRequest request
    ) throws UserExepion {
        Locale locale = localeService.getLocale(request);
        UserDTO userDTO = verificationService.verifyCode(email, code);
        
        if (userDTO == null) {
            String message = messageSource.getMessage("auth.verify.code.invalid", null, locale);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(message);
        }
        
        Users user = userService.convertUserDTOToUser(userDTO);
        user.setRole(Roles.builder().roleId(1).roleName(Roles.USER).build());
        userService.saveUser(user);
        
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(userDTO.getUsername(), userDTO.getPassword())
        );
        Users registeredUser = (Users) authentication.getPrincipal();
        String jwt = jwtTokenUtils.generateToken(registeredUser);
        
        return ResponseEntity.ok(jwt);
    }
}

