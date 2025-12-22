# HƯỚNG DẪN ĐĂNG NHẬP FACEBOOK VỚI SPRING SECURITY OAUTH2

## 📋 MỤC LỤC
1. [Tổng quan về OAuth2 Flow](#1-tổng-quan-về-oauth2-flow)
2. [Cấu hình Facebook App](#2-cấu-hình-facebook-app)
3. [Các file đã tạo và giải thích](#3-các-file-đã-tạo-và-giải-thích)
4. [Luồng hoạt động chi tiết](#4-luồng-hoạt-động-chi-tiết)
5. [Xử lý trường hợp không có email](#5-xử-lý-trường-hợp-không-có-email)
6. [Cách test](#6-cách-test)
7. [Lỗi thường gặp và cách debug](#7-lỗi-thường-gặp-và-cách-debug)

---

## 1. TỔNG QUAN VỀ OAUTH2 FLOW

### OAuth2 là gì?
OAuth2 là một **chuẩn xác thực** cho phép ứng dụng của bạn đăng nhập bằng tài khoản Facebook mà **KHÔNG CẦN** biết password của user.

### Luồng hoạt động (Flow):
```
1. User click "Đăng nhập với Facebook" trên frontend
   ↓
2. Frontend redirect đến: http://localhost:8080/oauth2/authorization/facebook
   ↓
3. Spring Security tự động redirect đến Facebook login page
   ↓
4. User đăng nhập Facebook và đồng ý cấp quyền
   ↓
5. Facebook redirect về: http://localhost:8080/login/oauth2/code/facebook
   ↓
6. Spring Security tự động xử lý và gọi OAuth2LoginSuccessHandler
   ↓
7. Handler lấy thông tin user, lưu vào DB, sinh JWT
   ↓
8. Redirect về frontend: http://localhost:3000/auth/callback?token=xxx
```

### Tại sao cần OAuth2?
- **Bảo mật**: Không cần lưu password Facebook
- **Tiện lợi**: User không cần tạo tài khoản mới
- **Tin cậy**: Facebook đảm bảo user đã xác thực

---

## 2. CẤU HÌNH FACEBOOK APP

### Bước 1: Tạo Facebook App
1. Truy cập: https://developers.facebook.com/
2. Vào **My Apps** > **Create App**
3. Chọn **Consumer** > **Next**
4. Điền tên app > **Create App**

### Bước 2: Lấy App ID và App Secret
1. Vào **Settings** > **Basic**
2. Copy **App ID** → Đây là `client-id`
3. Copy **App Secret** → Đây là `client-secret`

### Bước 3: Cấu hình OAuth Redirect URIs
1. Vào **Settings** > **Basic** > **Add Platform** > **Website**
2. Thêm **Site URL**: `http://localhost:8080`
3. Vào **Settings** > **Basic** > **Valid OAuth Redirect URIs**
4. Thêm: `http://localhost:8080/login/oauth2/code/facebook`

### Bước 4: Cấu hình quyền (Permissions)
1. Vào **App Review** > **Permissions and Features**
2. Request các quyền:
   - `email` (quan trọng nhất!)
   - `public_profile` (mặc định có sẵn)

### Bước 5: Cập nhật application.properties
```properties
# Thay YOUR_FACEBOOK_APP_ID và YOUR_FACEBOOK_APP_SECRET
spring.security.oauth2.client.registration.facebook.client-id=YOUR_FACEBOOK_APP_ID
spring.security.oauth2.client.registration.facebook.client-secret=YOUR_FACEBOOK_APP_SECRET
```

---

## 3. CÁC FILE ĐÃ TẠO VÀ GIẢI THÍCH

### 3.1. application.properties
**Vai trò**: Cấu hình thông tin Facebook OAuth2

**Các thuộc tính quan trọng**:
- `client-id`: ID của ứng dụng Facebook
- `client-secret`: Mật khẩu bí mật (KHÔNG được công khai!)
- `scope`: Quyền xin từ Facebook (`email,public_profile`)
- `redirect-uri`: Địa chỉ Facebook redirect về sau khi đăng nhập
- `user-info-uri`: Endpoint để lấy thông tin user từ Facebook

### 3.2. OAuth2LoginSuccessHandler.java
**Vai trò**: Xử lý sau khi đăng nhập Facebook thành công

**Các bước xử lý**:
1. Lấy thông tin user từ Facebook (email, name, picture)
2. Xử lý trường hợp không có email
3. Tìm hoặc tạo user trong database
4. Sinh JWT token
5. Redirect về frontend kèm token

### 3.3. WebSercurityConfig.java
**Vai trò**: Cấu hình Spring Security để enable OAuth2 login

**Thay đổi**:
- Thêm `.oauth2Login()` để enable OAuth2
- Thêm `successHandler()` để chỉ định handler xử lý
- Thêm các endpoint OAuth2 vào `permitAll()`

---

## 4. LUỒNG HOẠT ĐỘNG CHI TIẾT

### Bước 1: User click "Đăng nhập với Facebook"
Frontend redirect đến:
```
http://localhost:8080/oauth2/authorization/facebook
```

### Bước 2: Spring Security xử lý
Spring Security đọc cấu hình từ `application.properties`:
- Lấy `client-id` và `client-secret`
- Tạo authorization URL với các tham số:
  - `client_id`: App ID
  - `redirect_uri`: Callback URL
  - `scope`: email,public_profile
  - `response_type`: code

### Bước 3: Redirect đến Facebook
Spring Security redirect user đến:
```
https://www.facebook.com/v18.0/dialog/oauth?
  client_id=YOUR_APP_ID&
  redirect_uri=http://localhost:8080/login/oauth2/code/facebook&
  scope=email,public_profile&
  response_type=code
```

### Bước 4: User đăng nhập và cấp quyền
- User đăng nhập Facebook
- Facebook hiển thị dialog xin quyền
- User đồng ý → Facebook redirect về callback URL

### Bước 5: Facebook redirect về backend
```
http://localhost:8080/login/oauth2/code/facebook?code=AUTHORIZATION_CODE
```

### Bước 6: Spring Security đổi code lấy token
Spring Security tự động:
1. Gửi POST request đến `token-uri` để đổi `code` lấy `access_token`
2. Dùng `access_token` để gọi `user-info-uri` lấy thông tin user
3. Tạo `OAuth2User` object chứa thông tin user
4. Gọi `OAuth2LoginSuccessHandler.onAuthenticationSuccess()`

### Bước 7: Handler xử lý
```java
// Lấy thông tin từ Facebook
String email = attributes.get("email");
String name = attributes.get("name");
String pictureUrl = attributes.get("picture").get("data").get("url");

// Tìm hoặc tạo user
Users user = userRepository.findByEmail(email)
    .orElse(createNewUser(email, name));

// Sinh JWT
String jwt = jwtTokenUtils.generateToken(user);

// Redirect về frontend
redirect("http://localhost:3000/auth/callback?token=" + jwt);
```

---

## 5. XỬ LÝ TRƯỜNG HỢP KHÔNG CÓ EMAIL

### Tại sao Facebook có thể không trả về email?
1. **User không cấp quyền email**: Khi đăng nhập, Facebook hỏi xin quyền email, user có thể từ chối
2. **User đăng ký bằng số điện thoại**: Một số user đăng ký Facebook bằng số điện thoại, không có email
3. **Privacy settings**: User đã ẩn email trong privacy settings

### Giải pháp:
```java
String email = (String) attributes.get("email");
String username;

if (email != null && !email.isEmpty()) {
    // Có email: dùng email làm username
    username = email;
} else {
    // Không có email: dùng facebookId làm username
    String facebookId = (String) attributes.get("id");
    username = "facebook_" + facebookId;
    // Ví dụ: facebookId = "123456" => username = "facebook_123456"
}
```

### Lưu ý:
- Username phải **unique** trong database
- Format `facebook_{id}` đảm bảo không trùng với username thường
- Có thể lưu thêm `facebookId` vào database để liên kết

---

## 6. CÁCH TEST

### Bước 1: Cập nhật application.properties
```properties
spring.security.oauth2.client.registration.facebook.client-id=YOUR_APP_ID
spring.security.oauth2.client.registration.facebook.client-secret=YOUR_APP_SECRET
```

### Bước 2: Start backend
```bash
mvn spring-boot:run
```

### Bước 3: Test bằng browser
1. Mở browser và truy cập:
   ```
   http://localhost:8080/oauth2/authorization/facebook
   ```
2. Đăng nhập Facebook
3. Đồng ý cấp quyền
4. Kiểm tra xem có redirect về frontend không:
   ```
   http://localhost:3000/auth/callback?token=xxx
   ```

### Bước 4: Test với Postman
1. GET request đến:
   ```
   http://localhost:8080/oauth2/authorization/facebook
   ```
2. Postman sẽ tự động follow redirect
3. Kiểm tra response có chứa token không

---

## 7. LỖI THƯỜNG GẶP VÀ CÁCH DEBUG

### Lỗi 1: "Invalid redirect_uri"
**Nguyên nhân**: Redirect URI không khớp với cấu hình trong Facebook App

**Giải pháp**:
1. Vào Facebook Developer Console
2. Settings > Basic > Valid OAuth Redirect URIs
3. Thêm: `http://localhost:8080/login/oauth2/code/facebook`
4. Đảm bảo không có khoảng trắng, không có `/` ở cuối

### Lỗi 2: "App Not Setup"
**Nguyên nhân**: Facebook App chưa được cấu hình đúng

**Giải pháp**:
1. Kiểm tra App ID và App Secret đúng chưa
2. Đảm bảo App đang ở chế độ **Development** (cho localhost)
3. Thêm **Test Users** nếu cần

### Lỗi 3: "Email không được trả về"
**Nguyên nhân**: User không cấp quyền email hoặc không có email

**Giải pháp**:
- Code đã xử lý: Dùng `facebook_{id}` làm username
- Log để kiểm tra:
  ```java
  log.warn("Facebook user không có email! Sử dụng username: {}", username);
  ```

### Lỗi 4: "CORS Error"
**Nguyên nhân**: Frontend và backend khác origin

**Giải pháp**:
- Đã cấu hình trong `WebSercurityConfig.java`:
  ```java
  configuration.setAllowedOrigins(List.of("http://localhost:3000"));
  ```

### Lỗi 5: "User không được lưu vào database"
**Nguyên nhân**: Lỗi khi save user

**Debug**:
1. Kiểm tra log:
   ```java
   log.info("Tạo user mới từ Facebook: {}", username);
   ```
2. Kiểm tra database có user mới không
3. Kiểm tra exception trong console

### Lỗi 6: "JWT token không hợp lệ"
**Nguyên nhân**: Token không được sinh đúng

**Debug**:
1. Kiểm tra log:
   ```java
   log.info("Đã sinh JWT token cho user: {}", user.getUsername());
   ```
2. Copy token và decode tại: https://jwt.io/
3. Kiểm tra token có chứa username và role không

### Cách debug tổng quát:
1. **Bật log**:
   ```properties
   logging.level.com.example.projectc1023i1.handler=DEBUG
   logging.level.org.springframework.security=DEBUG
   ```

2. **Kiểm tra từng bước**:
   - Bước 1: Facebook redirect có về không?
   - Bước 2: Handler có được gọi không?
   - Bước 3: User có được lưu vào DB không?
   - Bước 4: JWT có được sinh không?
   - Bước 5: Redirect về frontend có đúng không?

3. **Sử dụng Postman**:
   - Test từng endpoint riêng biệt
   - Kiểm tra response và headers

---

## 8. TÓM TẮT

### Những gì đã làm:
1. ✅ Cấu hình Facebook OAuth2 trong `application.properties`
2. ✅ Tạo `OAuth2LoginSuccessHandler` để xử lý sau khi login thành công
3. ✅ Cấu hình Spring Security để enable OAuth2 login
4. ✅ Xử lý trường hợp không có email
5. ✅ Sinh JWT token và redirect về frontend

### Những gì cần làm tiếp:
1. ⚠️ Cập nhật `client-id` và `client-secret` trong `application.properties`
2. ⚠️ Cấu hình Facebook App trong Facebook Developer Console
3. ⚠️ Tạo frontend page `/auth/callback` để nhận token
4. ⚠️ Test và debug nếu có lỗi

### Kiến thức quan trọng:
- **OAuth2 Flow**: Authorization Code Flow
- **Spring Security OAuth2**: Tự động xử lý phần đăng nhập
- **Custom Handler**: Xử lý sau khi đăng nhập thành công
- **JWT Token**: Để frontend sử dụng
- **Email handling**: Xử lý trường hợp không có email

---

## 📞 HỖ TRỢ

Nếu gặp lỗi, kiểm tra:
1. Log trong console
2. Facebook Developer Console
3. Network tab trong browser DevTools
4. Database có user mới không

Chúc bạn code vui vẻ! 🚀



