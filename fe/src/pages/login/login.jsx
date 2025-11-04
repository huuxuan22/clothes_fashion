import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import "./login.css";
import {
  faFacebookF,
  faGoogle,
  faTiktok,
} from "@fortawesome/free-brands-svg-icons";
import { faZalo } from "@fortawesome/free-brands-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as loginService from "../../service/login-service";
import { currentUser, setToken, setUserPrincipal } from "../../redux/User/Action";
const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Validation schema với Yup
  const validationSchema = Yup.object().shape({
    username: Yup.string()
      .required("Tên tài khoản không được để trống")
      .min(4, "Tên tài khoản phải ít nhất 4 ký tự"),
    password: Yup.string()
      .required("Mật khẩu không được để trống")
      .min(6, "Mật khẩu phải ít nhất 6 ký tự"),
  });

  const {
    register,
    setError,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const onSubmit = async (data) => {
    try {
      const response = await loginService.login(data);

      if (response.success) {
        // Đăng nhập thành công
        const token = response.token || response.data;

        // 1. Lưu token vào localStorage
        localStorage.setItem("token", token);

        // 2. Lưu token vào Redux reducer
        dispatch(setToken(token));

        // 3. Lấy thông tin user từ API
        try {
          const userResponse = await dispatch(currentUser(token));

          if (userResponse.success) {
            const userPrincipal = userResponse.data;

            // 4. Lưu user_principal vào localStorage
            localStorage.setItem("user_principal", JSON.stringify(userPrincipal));

            // 5. Lưu user_principal vào Redux reducer
            dispatch(setUserPrincipal(userPrincipal));
          }
        } catch (userError) {
          console.error("Error fetching user info:", userError);
          // Vẫn tiếp tục login nếu không lấy được user info
        }

        // 6. Hiển thị thông báo đăng nhập thành công
        toast.success("Đăng nhập thành công!", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // 7. Redirect hoặc điều hướng đến trang chủ (sau 1 giây để người dùng thấy toast)
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        // Xử lý các loại lỗi khác nhau
        switch (response.errorType) {
          case 'validation':
            // Lỗi validation từ backend (400)
            // LoginErrors: { username?: string, password?: string }
            if (response.data?.username) {
              setError("username", {
                type: "manual",
                message: response.data.username,
              });
            }
            if (response.data?.password) {
              setError("password", {
                type: "manual",
                message: response.data.password,
              });
            }
            break;

          case 'authentication':
            // Lỗi xác thực (401): Sai tài khoản hoặc mật khẩu
            setError("password", {
              type: "manual",
              message: response.message || "Tài khoản hoặc mật khẩu không đúng.",
            });
            break;

          case 'server':
            // Lỗi server (500)
            alert(response.message || "Đã có lỗi xảy ra. Vui lòng thử lại sau.");
            break;

          case 'network':
            // Lỗi kết nối mạng
            alert(response.message || "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.");
            break;

          default:
            // Lỗi khác
            alert(response.message || "Đã có lỗi xảy ra. Vui lòng thử lại.");
        }
      }
    } catch (error) {
      // Catch unexpected errors
      console.error("Login error:", error);
      alert("Đã có lỗi không mong đợi xảy ra. Vui lòng thử lại.");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = (provider) => {
    alert(`Bạn đã chọn đăng nhập bằng ${provider}`);
    // Thêm logic xử lý đăng nhập tại đây
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="image-overlay">
        <img
          src="https://watermark.lovepik.com/photo/20211124/large/lovepik-fashion-womens-summer-shopping-image-picture_500961857.jpg"
          alt="background"
          className="background-image"
        />
        <div className="form-login">
          <h1>PTRAN-FASHION</h1>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Username Field */}
            <div className="username-field">
              <input
                type="text"
                placeholder="Tài khoản"
                {...register("username")}
              />
              {errors.username && (
                <div className="error-message-password">
                  <p>{errors.username.message}</p>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div className="password-field">
              <div className="password-field-input">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mật khẩu"
                  {...register("password")}
                />
                <span
                  className="toggle-password"
                  onClick={togglePasswordVisibility}
                >
                  <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                </span>
              </div>
            </div>
            {errors.password && (
              <div className="error-message-password">
                <p>{errors.password.message}</p>
              </div>
            )}
            <button type="submit">Đăng Nhập</button>
          </form>
          <div className="forgot-password">
            <a href="/forgot-password" className="forgot-password-link">
              Quên mật khẩu?
            </a>
          </div>

          <div className="login-3rd">
            <button
              className="login-button"
              onClick={() => handleLogin("Gmail")}
              style={{ backgroundColor: "#db4437" }}
            >
              <FontAwesomeIcon icon={faGoogle} style={{ marginRight: "10px" }} />
              Google
            </button>

            <button
              className="login-button"
              onClick={() => handleLogin("Facebook")}
              style={{ backgroundColor: "#3b5998" }}
            >
              <FontAwesomeIcon
                icon={faFacebookF}
                style={{ marginRight: "10px" }}
              />
              Facebook
            </button>
            <button
              className="login-button"
              onClick={() => handleLogin("TikTok")}
              style={{ backgroundColor: "#000000" }}
            >
              <FontAwesomeIcon icon={faTiktok} style={{ marginRight: "10px" }} />
              TikTok
            </button>
          </div>

          <div className="contact-info">
            <div className="contact">
              <a
                href="https://zalo.me/your-zalo-id"
                className="contact-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                Liên hệ qua Zalo !
              </a>

              <a href="tel:+849xxxxxxxx" className="contact-link">
                chat ngay với chúng tôi!
              </a>
            </div>
          </div>

          {/* Thêm liên kết "Quên mật khẩu" */}
          <p>
            Bạn chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
