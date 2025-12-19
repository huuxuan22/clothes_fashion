package com.example.projectc1023i1.mapper;

import com.example.projectc1023i1.respone.errorsValidate.LoginErrors;
import com.example.projectc1023i1.respone.errorsValidate.RegisterErrors;
import com.example.projectc1023i1.respone.errorsValidate.CreateSubCateErrors;
import org.springframework.stereotype.Component;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;

import java.util.HashMap;
import java.util.Map;
import java.util.function.BiConsumer;


@Component
public class ValidationErrorMapper {
    
    private final Map<String, BiConsumer<LoginErrors, String>> loginErrorMappers;
    private final Map<String, BiConsumer<RegisterErrors, String>> registerErrorMappers;
    private final Map<String, BiConsumer<CreateSubCateErrors, String>> createSubCateErrorMappers;
    
    public ValidationErrorMapper() {
        this.loginErrorMappers = new HashMap<>();
        this.loginErrorMappers.put("username", (errors, message) ->
            errors.setUsername(appendMessage(errors.getUsername(), message))
        );
        this.loginErrorMappers.put("password", (errors, message) ->
            errors.setPassword(appendMessage(errors.getPassword(), message))
        );

        this.registerErrorMappers = new HashMap<>();
        this.registerErrorMappers.put("username", (errors, message) ->
            errors.setUsername(appendMessage(errors.getUsername(), message))
        );
        this.registerErrorMappers.put("password", (errors, message) ->
            errors.setPassword(appendMessage(errors.getPassword(), message))
        );
        this.registerErrorMappers.put("email", (errors, message) ->
            errors.setEmail(appendMessage(errors.getEmail(), message))
        );
        this.registerErrorMappers.put("fullName", (errors, message) ->
            errors.setFullName(appendMessage(errors.getFullName(), message))
        );
        this.registerErrorMappers.put("gender", (errors, message) ->
            errors.setGender(appendMessage(errors.getGender(), message))
        );
        this.registerErrorMappers.put("numberphone", (errors, message) ->
            errors.setNumberphone(appendMessage(errors.getNumberphone(), message))
        );
        this.registerErrorMappers.put("birthday", (errors, message) ->
            errors.setBirthday(appendMessage(errors.getBirthday(), message))
        );

        this.createSubCateErrorMappers = new HashMap<>();
        this.createSubCateErrorMappers.put("categoriesId", (errors, message) ->
            errors.setCategoriesId(appendMessage(errors.getCategoriesId(), message))
        );
        this.createSubCateErrorMappers.put("subCategoryName", (errors, message) ->
            errors.setSubCategoryName(appendMessage(errors.getSubCategoryName(), message))
        );
    }
    
    public LoginErrors mapToLoginErrors(BindingResult bindingResult) {
        LoginErrors loginErrors = new LoginErrors();
        
        bindingResult.getFieldErrors().forEach(fieldError -> {
            String field = fieldError.getField();
            String message = fieldError.getDefaultMessage();
            
            // Sử dụng Strategy Pattern thay vì switch case
            BiConsumer<LoginErrors, String> mapper = loginErrorMappers.get(field);
            if (mapper != null) {
                mapper.accept(loginErrors, message);
            }
        });
        
        return loginErrors;
    }
    
    /**
     * Map BindingResult sang RegisterErrors
     */
    public RegisterErrors mapToRegisterErrors(BindingResult bindingResult) {
        RegisterErrors registerErrors = new RegisterErrors();
        
        bindingResult.getFieldErrors().forEach(fieldError -> {
            String field = fieldError.getField();
            String message = fieldError.getDefaultMessage();
            
            BiConsumer<RegisterErrors, String> mapper = registerErrorMappers.get(field);
            if (mapper != null) {
                mapper.accept(registerErrors, message);
            }
        });
        
        return registerErrors;
    }

    /**
     * Map BindingResult sang CreateSubCateErrors
     */
    public CreateSubCateErrors mapToCreateSubCateErrors(BindingResult bindingResult) {
        CreateSubCateErrors subCateErrors = new CreateSubCateErrors();

        bindingResult.getFieldErrors().forEach(fieldError -> {
            String field = fieldError.getField();
            String message = fieldError.getDefaultMessage();

            BiConsumer<CreateSubCateErrors, String> mapper = createSubCateErrorMappers.get(field);
            if (mapper != null) {
                mapper.accept(subCateErrors, message);
            }
        });

        return subCateErrors;
    }
    
    /**
     * Append message nếu đã có message, hoặc set message mới
     */
    private String appendMessage(String existingMessage, String newMessage) {
        return existingMessage == null ? newMessage : existingMessage + "; " + newMessage;
    }
}

