package com.example.projectc1023i1.controller.auth;

import com.example.projectc1023i1.Dto.UserDTO;
import com.example.projectc1023i1.Exception.UserExepion;
import com.example.projectc1023i1.component.JwtTokenUtils;
import com.example.projectc1023i1.model.Roles;
import com.example.projectc1023i1.model.Users;
import com.example.projectc1023i1.request.LoginRequest;
import com.example.projectc1023i1.respone.errorsValidate.LoginErrors;
import com.example.projectc1023i1.respone.errorsValidate.RegisterErrors;
import com.example.projectc1023i1.service.AuthService;
import com.example.projectc1023i1.service.RedisService;
import com.example.projectc1023i1.service.ValidationErrorMapper;
import com.example.projectc1023i1.service.VerificationService;
import com.example.projectc1023i1.service.impl.IUserService;
import com.example.projectc1023i1.utils.GetTokenFromRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

/**
 * AuthController - Controller xử lý authentication và registration
 * 
 * Kết hợp logic từ LoginController và LoginControllerRefactored
 * Tuân thủ SOLID principles:
 * - Single Responsibility: Controller chỉ điều phối requests
 * - Business logic được chuyển sang Service layer
 * - Validation errors được xử lý bởi ValidationErrorMapper
 * - Exception handling được xử lý bởi GlobalExceptionHandler
 */
@RestController
@RequestMapping("/api")
public class AuthController {
    
    private final AuthService authService;
    private final ValidationErrorMapper validationErrorMapper;
    private final JwtTokenUtils jwtTokenUtils;
    private final RedisService redisService;
    private final IUserService userService;
    private final VerificationService verificationService;
    private final AuthenticationManager authenticationManager;
    
    // Constructor injection (best practice)
    public AuthController(
            AuthService authService,
            ValidationErrorMapper validationErrorMapper,
            JwtTokenUtils jwtTokenUtils,
            RedisService redisService,
            IUserService userService,
            VerificationService verificationService,
            AuthenticationManager authenticationManager
    ) {
        this.authService = authService;
        this.validationErrorMapper = validationErrorMapper;
        this.jwtTokenUtils = jwtTokenUtils;
        this.redisService = redisService;
        this.userService = userService;
        this.verificationService = verificationService;
        this.authenticationManager = authenticationManager;
    }
    
    /**
     * Đăng nhập
     * 
     * @param loginRequest Login request từ client
     * @param bindingResult Validation result
     * @return JWT token hoặc error response
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest loginRequest,
            BindingResult bindingResult
    ) {
        if (bindingResult.hasErrors()) {
            LoginErrors loginErrors = validationErrorMapper.mapToLoginErrors(bindingResult);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(loginErrors);
        }
        
        String token = authService.authenticate(loginRequest);
        return ResponseEntity.ok(token);
    }
    
    /**
     * Đăng xuất
     * 
     * @param user Authenticated user
     * @param request HTTP request
     * @return Success message
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            @AuthenticationPrincipal Users user,
            HttpServletRequest request
    ) {
        String token = GetTokenFromRequest.getTokenFromRequest(request);
        if (token != null) {
            String username = jwtTokenUtils.extractUserName(token);
            redisService.addTokenList(username, token);
            return ResponseEntity.ok("Đăng xuất thành công");
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Không tìm thấy token hợp lệ");
        }
    }
    
    /**
     * Đăng ký - Gửi mã xác thực
     * 
     * @param userDTO User data từ client
     * @param bindingResult Validation result
     * @return UserDTO hoặc validation errors
     * @throws UserExepion nếu có lỗi
     */
    @PutMapping("/register")
    public ResponseEntity<?> register(
            @Valid @RequestBody UserDTO userDTO,
            BindingResult bindingResult
    ) throws UserExepion {
        // Validation errors được xử lý bởi ValidationErrorMapper
        if (bindingResult.hasErrors()) {
            RegisterErrors registerErrors = validationErrorMapper.mapToRegisterErrors(bindingResult);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(registerErrors);
        }
        
        // Gửi mã xác thực
        verificationService.sendVerificationCode(userDTO.getEmail());
        return ResponseEntity.ok(userDTO);
    }
    
    /**
     * Gửi lại mã xác thực
     * 
     * @param email Email của user
     * @return Email đã gửi
     */
    @PostMapping("/send-again")
    public ResponseEntity<?> sendCodeAgain(@RequestParam String email) {
        verificationService.sendVerificationCode(email);
        return ResponseEntity.ok(email);
    }
    
    /**
     * Xác thực mã và lưu user
     * 
     * @param code Mã xác thực
     * @param userDTO User data
     * @return JWT token hoặc error
     * @throws UserExepion nếu có lỗi
     */
    @PostMapping("/save")
    public ResponseEntity<?> verifyCodeAndSave(
            @RequestParam String code,
            @RequestBody UserDTO userDTO
    ) throws UserExepion {
        // Xác thực mã
        boolean isValid = verificationService.verifyCode(userDTO.getEmail(), code);
        if (!isValid) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("mã xác thực không đúng");
        }
        
        // Chuyển đổi và lưu user
        Users user = userService.convertUserDTOToUser(userDTO);
        user.setRole(Roles.builder().roleId(1).roleName(Roles.USER).build());
        userService.saveUser(user);
        
        // Tự động đăng nhập sau khi đăng ký
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(userDTO.getUsername(), userDTO.getPassword())
        );
        Users registeredUser = (Users) authentication.getPrincipal();
        String jwt = jwtTokenUtils.generateToken(registeredUser);
        
        return ResponseEntity.ok(jwt);
    }
}

