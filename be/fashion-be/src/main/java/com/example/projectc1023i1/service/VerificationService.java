package com.example.projectc1023i1.service;

import com.example.projectc1023i1.Dto.UserDTO;
import com.example.projectc1023i1.Exception.BlockEmailException;
import com.example.projectc1023i1.Exception.BlockEmailExceptionUnthorizi;
import com.example.projectc1023i1.service.template.EmailTemplateService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Random;
import java.util.concurrent.TimeUnit;

@Service
public class VerificationService {
    private static final int MAX_ATTEMPTS = 5; // Số lần gửi tối đa
    private static final long BLOCK_TIME = 10 * 60; // Thời gian khóa (10 phút)
    private static final long CODE_EXPIRATION = 10 * 60; // Mã hết hạn sau 10 phút
    
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Autowired
    private EmailTemplateService emailTemplateService;

 
    public void sendVerificationCode(UserDTO userDTO) {
        String email = userDTO.getEmail();
        
        // Kiểm tra xem tài khoản có bị chặn không
        if (redisTemplate.hasKey("blocked:" + email)) {
            throw new BlockEmailException("Tài khoản của bạn đã bị chặn do gửi quá nhiều yêu cầu.");
        }

        // Đếm số lần gửi mã
        String attemptKey = "attempts:" + email;
        Integer attempts = Optional.ofNullable(redisTemplate.opsForValue().get(attemptKey))
                .map(Integer::valueOf).orElse(0);

        if (attempts >= MAX_ATTEMPTS) {
            // Chặn tài khoản trong 10 phút
            redisTemplate.opsForValue().set("blocked:" + email, "true", BLOCK_TIME, TimeUnit.SECONDS);
            throw new BlockEmailExceptionUnthorizi("hiện tại email này đang bị chặn 10 phút bởi vì bạn đã gửi quá 5 lần xác nhận code");
        }

        // Tăng số lần gửi mã
        redisTemplate.opsForValue().set(attemptKey, String.valueOf(attempts + 1), CODE_EXPIRATION, TimeUnit.SECONDS);
        
        // Tạo và lưu OTP với key OTP_email
        String code = generateRandomCode();
        String otpKey = "OTP_" + email;
        redisTemplate.opsForValue().set(otpKey, code, CODE_EXPIRATION, TimeUnit.SECONDS);
        
        // Lưu UserDTO vào Redis (chỉ cho register)
        try {
            String userDataJson = objectMapper.writeValueAsString(userDTO);
            String dataKey = "DATA_" + email;
            redisTemplate.opsForValue().set(dataKey, userDataJson, CODE_EXPIRATION, TimeUnit.SECONDS);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Lỗi khi lưu dữ liệu user vào Redis", e);
        }
        
        // Gửi email sử dụng EmailTemplateService
        sendEmail(email, code, "Mã xác thực đăng ký tài khoản");
    }
    
    /**
     * Gửi mã xác thực cho change password (không lưu UserDTO)
     * 
     * @param email Email của user
     */
    public void sendVerificationCodeForPasswordChange(String email) {
        // Kiểm tra xem tài khoản có bị chặn không
        if (redisTemplate.hasKey("blocked:" + email)) {
            throw new BlockEmailException("Tài khoản của bạn đã bị chặn do gửi quá nhiều yêu cầu.");
        }

        // Đếm số lần gửi mã
        String attemptKey = "attempts:" + email;
        Integer attempts = Optional.ofNullable(redisTemplate.opsForValue().get(attemptKey))
                .map(Integer::valueOf).orElse(0);

        if (attempts >= MAX_ATTEMPTS) {
            // Chặn tài khoản trong 10 phút
            redisTemplate.opsForValue().set("blocked:" + email, "true", BLOCK_TIME, TimeUnit.SECONDS);
            throw new BlockEmailExceptionUnthorizi("hiện tại email này đang bị chặn 10 phút bởi vì bạn đã gửi quá 5 lần xác nhận code");
        }

        // Tăng số lần gửi mã
        redisTemplate.opsForValue().set(attemptKey, String.valueOf(attempts + 1), CODE_EXPIRATION, TimeUnit.SECONDS);
        
        // Tạo và lưu OTP với key OTP_email (không lưu UserDTO)
        String code = generateRandomCode();
        String otpKey = "OTP_" + email;
        redisTemplate.opsForValue().set(otpKey, code, CODE_EXPIRATION, TimeUnit.SECONDS);
        
        // Gửi email sử dụng EmailTemplateService
        sendEmail(email, code, "Mã xác thực đổi mật khẩu");
    }

    public UserDTO getUserDTOFromRedis(String email) {
        String dataKey = "DATA_" + email;
        String userDataJson = redisTemplate.opsForValue().get(dataKey);
        
        if (userDataJson == null) {
            return null;
        }
        
        try {
            return objectMapper.readValue(userDataJson, UserDTO.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Lỗi khi đọc dữ liệu user từ Redis", e);
        }
    }

    /**
     * Verify OTP code (dùng cho change password)
     * Chỉ verify OTP, không cần UserDTO
     * 
     * @param email Email của user
     * @param code Mã OTP
     * @return true nếu OTP hợp lệ, false nếu không hợp lệ
     */
    public boolean verifyOtpCode(String email, String code) {
        String otpKey = "OTP_" + email;
        String storedCode = redisTemplate.opsForValue().get(otpKey);
        
        if (storedCode == null || !storedCode.equals(code)) {
            return false;
        }
        
        // Xóa OTP sau khi verify thành công
        redisTemplate.delete(otpKey);
        redisTemplate.delete("attempts:" + email);
        redisTemplate.delete("blocked:" + email);
        
        return true;
    }


    public UserDTO verifyCode(String email, String code) {
        String otpKey = "OTP_" + email;
        String storedCode = redisTemplate.opsForValue().get(otpKey);
        
        if (storedCode == null || !storedCode.equals(code)) {
            return null;
        }
        
        // Nếu mã hợp lệ, lấy UserDTO từ Redis
        String dataKey = "DATA_" + email;
        String userDataJson = redisTemplate.opsForValue().get(dataKey);
        
        if (userDataJson == null) {
            return null;
        }
        
        try {
            UserDTO userDTO = objectMapper.readValue(userDataJson, UserDTO.class);
            
            // Xóa các key trong Redis sau khi verify thành công
            redisTemplate.delete(otpKey);
            redisTemplate.delete(dataKey);
            redisTemplate.delete("attempts:" + email);
            redisTemplate.delete("blocked:" + email);
            
            return userDTO;
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Lỗi khi đọc dữ liệu user từ Redis", e);
        }
    }

    private String generateRandomCode() {
        Random random = new Random();
        return String.format("%06d", random.nextInt(999999));
    }

    /**
     * Gửi email xác thực sử dụng EmailTemplateService
     * 
     * @param to Email người nhận
     * @param code Mã OTP 6 số
     * @param subject Tiêu đề email
     */
    private void sendEmail(String to, String code, String subject) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom("phamphuongtran2004@gmail.com");
            helper.setTo(to);
            helper.setSubject(subject);
            
            // Sử dụng EmailTemplateService để tạo HTML template từ Thymeleaf
            String htmlContent = emailTemplateService.buildVerificationCodeTemplate(code);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Lỗi khi gửi email: " + e.getMessage(), e);
        }
    }
}
