package com.example.projectc1023i1.exception;

import com.example.projectc1023i1.respone.ErrorRespones;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Global Exception Handler
 * 
 * Xử lý tất cả exceptions một cách nhất quán
 * Tuân thủ Single Responsibility: chỉ xử lý exceptions
 */
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorRespones> handleBadCredentials(BadCredentialsException e) {
        ErrorRespones error = new ErrorRespones(
                e.getMessage() != null ? e.getMessage() : "Tài khoản không tồn tại hoặc mật khẩu không đúng.",
                HttpStatus.UNAUTHORIZED.value()
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorRespones> handleGenericException(Exception e) {
        ErrorRespones error = new ErrorRespones(
                "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
                HttpStatus.INTERNAL_SERVER_ERROR.value()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
