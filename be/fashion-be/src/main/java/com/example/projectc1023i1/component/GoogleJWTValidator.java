package com.example.projectc1023i1.component;

import com.example.projectc1023i1.Exception.EmailExistException;
import com.example.projectc1023i1.model.Roles;
import com.example.projectc1023i1.model.Users;
import com.example.projectc1023i1.repository.impl.IRoleRepo;
import com.example.projectc1023i1.repository.impl.IUserRepository;
import com.nimbusds.jose.JWSObject;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.crypto.RSASSAVerifier;
import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.JWTParser;
import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.net.URL;
import java.security.interfaces.RSAPublicKey;
import java.util.List;
import java.util.Optional;

@Component
public class GoogleJWTValidator {

    @Autowired
    private  IUserRepository userRepository;

    @Autowired
    private IRoleRepo roleRepo;

    private static final String GOOGLE_CERTS_URL = "https://www.googleapis.com/oauth2/v3/certs";

    // 1. Lấy danh sách public keys từ Google
    public static JWKSet getGooglePublicKeys() throws Exception {
        URL url = new URL(GOOGLE_CERTS_URL);
        return JWKSet.load(url);
    }

    // 2. Giải mã và xác thực JWT token
    public static boolean validateToken(String jwtToken) throws Exception {
        // Phân tích JWT token
        JWSObject jwsObject = JWSObject.parse(jwtToken);

        // Lấy kid từ header JWT token
        String kid = jwsObject.getHeader().getKeyID();

        // Lấy public keys từ Google
        JWKSet jwkSet = getGooglePublicKeys();

        // Tìm khóa công khai tương ứng với kid
        JWK jwk = findPublicKeyByKid(jwkSet, kid);

        if (jwk != null) {
            RSAPublicKey rsaPublicKey = (RSAPublicKey) ((RSAKey) jwk).toPublicKey();
            JWSVerifier verifier = new RSASSAVerifier(rsaPublicKey);

            // Kiểm tra chữ ký của JWT token
            if (jwsObject.verify(verifier)) {
                // Token hợp lệ, giải mã thông tin người dùng từ payload
                String payload = jwsObject.getPayload().toString();
                System.out.println("Token is valid, Payload: " + payload);
                return true;
            }
        }
        return false; // Token không hợp lệ
    }

    // 3. Tìm public key theo kid trong danh sách
    public static JWK findPublicKeyByKid(JWKSet jwkSet, String kid) {
        List<JWK> keys = jwkSet.getKeys();
        for (JWK key : keys) {
            if (key.getKeyID().equals(kid)) {
                return key;
            }
        }
        return null;
    }



    public UserDetails extractUserInfo(String jwtToken) throws Exception {
        JWTClaimsSet claims = JWTParser.parse(jwtToken).getJWTClaimsSet();
        String userId = claims.getStringClaim("sub");
        String email = claims.getStringClaim("email");
        String name = claims.getStringClaim("name");
        String picture = claims.getStringClaim("picture");

        System.out.println("User ID: " + userId);
        System.out.println("Email: " + email);
        System.out.println("Name: " + name);
        Users user = new Users();
        user.setFullName(name);
        if (userRepository.existsByEmail(email)) {
            throw new EmailExistException("email này đã tồn tại");
        }
        user.setEmail(email);
        user.setImgUrl(picture);
        user.setRole(roleRepo.findByRoleId(2));
        return user;
    }

    /**
     * Extract user info from Google JWT token and get or create user
     * If user exists, return existing user; otherwise create new user
     */
    public Users getOrCreateUserFromGoogleToken(String jwtToken) throws Exception {
        // Validate token first
        if (!validateToken(jwtToken)) {
            throw new Exception("Invalid Google token");
        }

        // Extract user info from token
        JWTClaimsSet claims = JWTParser.parse(jwtToken).getJWTClaimsSet();
        String googleUserId = claims.getStringClaim("sub");
        String email = claims.getStringClaim("email");
        String name = claims.getStringClaim("name");
        String picture = claims.getStringClaim("picture");

        System.out.println("Google User ID: " + googleUserId);
        System.out.println("Email: " + email);
        System.out.println("Name: " + name);

        // Check if user exists by email
        Optional<Users> existingUserOptional = userRepository.findByEmail(email);
        if (existingUserOptional.isPresent()) {
            Users existingUser = existingUserOptional.get();
            // Update user info if needed
            if (picture != null && !picture.equals(existingUser.getImgUrl())) {
                existingUser.setImgUrl(picture);
            }
            if (name != null && !name.equals(existingUser.getFullName())) {
                existingUser.setFullName(name);
            }
            return existingUser;
        }

        // Create new user
        Users newUser = new Users();
        newUser.setEmail(email);
        newUser.setFullName(name != null ? name : email.split("@")[0]);
        newUser.setImgUrl(picture);
        newUser.setUsername(email); // Use email as username
        newUser.setPassword(""); // Google users don't have password
        newUser.setIsActive(true);
        newUser.setRole(roleRepo.findByRoleId(2)); // Default role: USER
        return newUser;
    }

}
