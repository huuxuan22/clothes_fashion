package com.example.projectc1023i1.handler;

import com.example.projectc1023i1.Exception.UserExepion;
import com.example.projectc1023i1.component.JwtTokenUtils;
import com.example.projectc1023i1.model.Users;
import com.example.projectc1023i1.repository.impl.IUserRepository;
import com.example.projectc1023i1.service.impl.IUserService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
//import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;

/**
 * ============================================
 * GIẢI THÍCH: OAuth2LoginSuccessHandler
 * ============================================
 * 
 * Đây là class xử lý sau khi user đăng nhập Facebook thành công.
 * 
 * LUỒNG HOẠT ĐỘNG:
 * 1. User click "Đăng nhập với Facebook" trên frontend
 * 2. Frontend redirect đến: http://localhost:8080/oauth2/authorization/facebook
 * 3. Spring Security tự động redirect đến Facebook login page
 * 4. User đăng nhập Facebook và đồng ý cấp quyền
 * 5. Facebook redirect về: http://localhost:8080/login/oauth2/code/facebook
 * 6. Spring Security tự động xử lý và gọi method onAuthenticationSuccess() ở đây
 * 
 * TẠI SAO CẦN CLASS NÀY?
 * - Spring Security chỉ xử lý phần đăng nhập với Facebook
 * - Sau khi đăng nhập thành công, Spring Security không biết phải làm gì tiếp
 * - Chúng ta cần tự viết logic để:
 *   + Lấy thông tin user từ Facebook (email, name, picture)
 *   + Lưu user vào database (nếu chưa có)
 *   + Sinh JWT token
 *   + Redirect về frontend kèm token
 * 
 * NẾU KHÔNG CÓ CLASS NÀY:
 * - User đăng nhập Facebook thành công nhưng không có token để dùng
 * - Frontend không biết user đã đăng nhập
 * - User không thể truy cập các API protected
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final IUserRepository userRepository;
    private final IUserService userService;
    private final JwtTokenUtils jwtTokenUtils;

    /**
     * Method này được Spring Security tự động gọi sau khi đăng nhập OAuth2 thành công
     * 
     * @param request: HttpServletRequest chứa thông tin request
     * @param response: HttpServletResponse để redirect về frontend
     * @param authentication: Chứa thông tin user đã đăng nhập (OAuth2User)
     * 
     * GIẢI THÍCH authentication:
     * - Sau khi đăng nhập Facebook thành công, Spring Security tạo một Authentication object
     * - Authentication.getPrincipal() sẽ trả về OAuth2User
     * - OAuth2User chứa thông tin user từ Facebook (id, name, email, picture)
     */
//    @Override
//    public void onAuthenticationSuccess(
//            HttpServletRequest request,
//            HttpServletResponse response,
//            Authentication authentication
//    ) throws IOException, ServletException {
//
//        log.info("=== BẮT ĐẦU XỬ LÝ FACEBOOK LOGIN SUCCESS ===");
//
//        // BƯỚC 1: Lấy thông tin user từ Facebook
//        // authentication.getPrincipal() trả về OAuth2User
//        // OAuth2User là interface của Spring Security chứa thông tin user từ OAuth2 provider (Facebook)
//        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
//
//        // Lấy attributes từ OAuth2User
//        // Attributes là Map<String, Object> chứa tất cả thông tin Facebook trả về
//        // Ví dụ: {id: "123456", name: "Nguyen Van A", email: "a@gmail.com"}
//        Map<String, Object> attributes = oAuth2User.getAttributes();
//
//        log.info("Facebook attributes: {}", attributes);
//
//        // BƯỚC 2: Extract thông tin cần thiết từ attributes
//        // Facebook trả về email trong key "email"
//        // NHƯNG: Facebook có thể KHÔNG trả về email nếu user không cấp quyền!
//        String email = (String) attributes.get("email");
//        String name = (String) attributes.get("name");
//        String facebookId = (String) attributes.get("id");
//
//        // Lấy picture URL từ Facebook
//        // Facebook trả về picture dưới dạng nested object: {picture: {data: {url: "..."}}}
//        String pictureUrl = null;
//        if (attributes.get("picture") != null) {
//            Map<String, Object> pictureData = (Map<String, Object>) attributes.get("picture");
//            if (pictureData != null && pictureData.get("data") != null) {
//                Map<String, Object> data = (Map<String, Object>) pictureData.get("data");
//                pictureUrl = (String) data.get("url");
//            }
//        }
//
//        log.info("Extracted info - Email: {}, Name: {}, FacebookId: {}, Picture: {}",
//                email, name, facebookId, pictureUrl);
//
//        // BƯỚC 3: Xử lý trường hợp KHÔNG CÓ EMAIL
//        // Đây là điểm QUAN TRỌNG nhất!
//        //
//        // TẠI SAO FACEBOOK CÓ THỂ KHÔNG TRẢ VỀ EMAIL?
//        // 1. User không cấp quyền email khi đăng nhập
//        // 2. User đăng ký Facebook bằng số điện thoại (không có email)
//        // 3. User đã ẩn email trong privacy settings
//        //
//        // GIẢI PHÁP:
//        // - Nếu không có email, ta dùng facebookId làm username
//        // - Format: "facebook_{facebookId}" để tránh trùng với username thường
//        // - Ví dụ: facebookId = "123456" => username = "facebook_123456"
//        String username;
//        if (email != null && !email.isEmpty()) {
//            // Có email: dùng email làm username
//            username = email;
//        } else {
//            // Không có email: dùng facebookId làm username
//            username = "facebook_" + facebookId;
//            log.warn("Facebook user không có email! Sử dụng username: {}", username);
//        }
//
//        // BƯỚC 4: Tìm hoặc tạo user trong database
//        Users user;
//        if (email != null && !email.isEmpty()) {
//            // Tìm user theo email (nếu có email)
//            user = userRepository.findByEmail(email)
//                    .orElse(null);
//        } else {
//            // Không có email: tìm theo username (facebook_{id})
//            user = userRepository.findByUsername(username)
//                    .orElse(null);
//        }
//
//        if (user == null) {
//            // User chưa tồn tại: TẠO MỚI
//            log.info("Tạo user mới từ Facebook: {}", username);
//            user = createNewUserFromFacebook(email, name, username, pictureUrl, facebookId);
//            try {
//                user = userService.saveUser(user);
//            } catch (UserExepion e) {
//                throw new RuntimeException(e);
//            }
//        } else {
//            // User đã tồn tại: CẬP NHẬT thông tin
//            log.info("User đã tồn tại, cập nhật thông tin: {}", user.getUsername());
//            updateExistingUser(user, name, pictureUrl);
//            user = userRepository.save(user);
//        }
//
//        // BƯỚC 5: Sinh JWT token
//        // TẠI SAO CẦN JWT?
//        // - Sau khi đăng nhập Facebook, user chỉ có session trong Spring Security
//        // - Frontend (React) không thể dùng session này
//        // - Frontend cần JWT token để gửi kèm mỗi request (trong header Authorization)
//        // - JWT token chứa thông tin user (username, role) đã được mã hóa
//        String jwtToken = jwtTokenUtils.generateToken(user);
//        log.info("Đã sinh JWT token cho user: {}", user.getUsername());
//
//        // BƯỚC 6: Redirect về frontend kèm token
//        // Format: http://localhost:3000/auth/callback?token=xxx
//        // Frontend sẽ đọc token từ URL và lưu vào localStorage
//        String frontendUrl = "http://localhost:3000/auth/callback?token=" + jwtToken;
//
//        log.info("Redirect về frontend: {}", frontendUrl);
//
//        // Redirect về frontend
//        getRedirectStrategy().sendRedirect(request, response, frontendUrl);
//
//        log.info("=== HOÀN THÀNH XỬ LÝ FACEBOOK LOGIN ===");
//    }
    
    /**
     * Tạo user mới từ thông tin Facebook
     * 
     * GIẢI THÍCH:
     * - Method này chỉ được gọi khi user chưa tồn tại trong database
     * - Tạo user mới với role USER (roleId = 2)
     * - Password để trống vì user đăng nhập bằng Facebook (không cần password)
     */
    private Users createNewUserFromFacebook(
            String email,
            String name,
            String username,
            String pictureUrl,
            String facebookId
    ) {
        Users user = new Users();
        
        // Email: có thể null nếu Facebook không trả về
        user.setEmail(email);
        
        // Full name: từ Facebook
        user.setFullName(name != null ? name : username);
        
        // Username: email hoặc "facebook_{id}"
        user.setUsername(username);
        
        // Password: để trống vì đăng nhập bằng Facebook
        user.setPassword("");
        
        // Picture URL từ Facebook
        user.setImgUrl(pictureUrl);
        
        // Active: mặc định true
        user.setIsActive(true);
        
        // Role: mặc định USER (roleId = 2)
        // Cần import Roles class
        user.setRole(com.example.projectc1023i1.model.Roles.builder()
                .roleId(2)
                .roleName(com.example.projectc1023i1.model.Roles.USER)
                .build());
        
        return user;
    }
    
    /**
     * Cập nhật thông tin user đã tồn tại
     * 
     * GIẢI THÍCH:
     * - Method này được gọi khi user đã có trong database
     * - Cập nhật name và picture nếu có thay đổi
     * - KHÔNG cập nhật email vì email là unique và không đổi
     */
    private void updateExistingUser(Users user, String name, String pictureUrl) {
        if (name != null && !name.equals(user.getFullName())) {
            user.setFullName(name);
        }
        if (pictureUrl != null && !pictureUrl.equals(user.getImgUrl())) {
            user.setImgUrl(pictureUrl);
        }
    }
}



