package com.example.projectc1023i1.config;

import com.example.projectc1023i1.filter.JwtTokenFilter;
import com.example.projectc1023i1.model.Roles;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.CorsConfigurer;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

import static com.example.projectc1023i1.model.Roles.ADMIN;
import static org.springframework.http.HttpMethod.*;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class WebSercurityConfig {
    private final UserDetailsService userDetailsService;
    private final JwtTokenFilter jwtTokenFilter;
    @Bean
    public MappingJackson2HttpMessageConverter jsonConverter() {
        return new MappingJackson2HttpMessageConverter();
    }
    // thàng này chính là choost giao thông chặn cửa xem  thử đã đủ giấy tờ hay chưa

    /**
     *  cau hinh bao mat cho ung dung
     * @param http doi tuong HttpSecurity de bao mat cho cac yeu cua cho HTTP
     * @return tra ve cau hinh bao mat da tuy chinh
     * @throws Exception nem ra ngoai le neu xay ra loi trong qua trinh bao mat
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http

                .csrf(AbstractHttpConfigurer:: disable)
                .addFilterBefore(jwtTokenFilter, UsernamePasswordAuthenticationFilter.class)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/swagger-resources/**",
                                "/webjars/**",
                                // Public endpoints - không cần authentication
                                "/api/login",
                                "/api/register",
                                "/api/send",
                                "/api/send-again",
                                "/api/save",
                                "/api/forgot-password",
                                "/api/reset-password",
                                "/api/auth/google",
                                "/api/payment/create-payment",
                                "/api/payment/payment_info",
                                "/api/comment/**",
                                "/api/categories/**",
                                "/api/subcategory/**",
                                "/api/size/**",
                                "/api/color/**",
                                "/image/**",
                                "/ws/**",
                                "/get-all-category-employee",
                                // Public product endpoints - không cần authentication
                                "/admin/product/standOut-nam",
                                "/admin/product/standOut-nu",
                                "/admin/product/search",
                                "/admin/product/totalPage",
                                "/admin/product/top-deal",
                                "/admin/product/category",
                                "/admin/product/discount-product",
                                "/admin/product/detail",
                                "/admin/product/image",
                                "/admin/product/same",
                                "/admin/product/count",
                                "/admin/product/solid",
                                "/admin/product/select-color",
                                "/admin/product/searchByName",
                                // Public user endpoints - không cần authentication
                                "/api/users/find-product",
                                "/api/users/count-all-product",
                                "/api/users/get-all-collection",
                                "/api/users/collection/first",
                                "/api/users/collection/second",
                                // Public coupon/deal endpoints - không cần authentication để xem
                                "/api/users/coupons",
                                "/api/users/deals",
                                "/api/users/get-coupon",
                                "/api/users/get-deal",
                                "/api/admin/coupon/get-all",
                                "/api/admin/deal/get-all"
                        ).permitAll()
                        .anyRequest().authenticated()
                )
                .csrf(AbstractHttpConfigurer::disable);
        http.cors(new Customizer<CorsConfigurer<HttpSecurity>>() {// dùng để tùy chỉnh cấu hình Cors
            /**
             * cau hinh thiet lap CORS cho ung dung
             * @param httpSecurityCorsConfigurer doi tuong CorsConfigurer de cau hinh bao mat CORS cho ung dung
             */
            @Override
            public void customize(CorsConfigurer<HttpSecurity> httpSecurityCorsConfigurer) {
                CorsConfiguration configuration = new CorsConfiguration();
                configuration.setAllowCredentials(true); // dùng cookie/Authorization

                // KHÔNG dùng "*"; liệt kê cụ thể các origin được phép
                configuration.setAllowedOrigins(List.of(
                        "http://localhost:3000"
                        //, "https://your-domain.com"
                ));

                configuration.setAllowedMethods(Arrays.asList("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
                configuration.setAllowedHeaders(Arrays.asList("authorization","content-type","x-auth-token"));
                configuration.setExposedHeaders(List.of("x-auth-token"));

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                httpSecurityCorsConfigurer.configurationSource(source);
            }
        }) ;
        return http.build();
    }





}
