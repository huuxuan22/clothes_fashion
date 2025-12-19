package com.example.projectc1023i1.Validation.user;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.FIELD,ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = NotExistUsernameValidator.class)
public @interface NotExistUsername {
    String message() default "*Tài khoản Không tồn tại";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
