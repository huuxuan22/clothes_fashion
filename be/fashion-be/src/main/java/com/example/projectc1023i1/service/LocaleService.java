package com.example.projectc1023i1.service;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.LocaleResolver;

import java.util.Locale;

@Service
public class LocaleService {
    
    private final LocaleResolver localeResolver;
    
    public LocaleService(LocaleResolver localeResolver) {
        this.localeResolver = localeResolver;
    }
    
    /**
     * Lấy locale từ HttpServletRequest
     * @param request HttpServletRequest
     * @return Locale
     */
    public Locale getLocale(HttpServletRequest request) {
        return localeResolver.resolveLocale(request);
    }
    
    /**
     * Lấy locale hiện tại từ LocaleContextHolder (không cần request)
     * @return Locale
     */
    public Locale getCurrentLocale() {
        return LocaleContextHolder.getLocale();
    }
}

