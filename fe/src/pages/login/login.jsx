import React, { useState, useEffect } from "react";
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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
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
      debugger;
      if (response.success) {
        // Đăng nhập thành công
        // Backend trả về: { token, user }
        const token = response.token || response.data?.token;
        const userPrincipal = response.user || response.data?.user;

        // 1. Lưu token vào localStorage
        localStorage.setItem("token", token);

        // 2. Lưu token vào Redux reducer
        dispatch(setToken(token));

        // 3. Lưu user_principal vào localStorage và Redux
        if (userPrincipal) {
          localStorage.setItem("user_principal", JSON.stringify(userPrincipal));
          dispatch(setUserPrincipal(userPrincipal));
        } else {
          // Fallback: Nếu không có user trong response, gọi API để lấy
          try {
            const userResponse = await dispatch(currentUser());
            if (userResponse?.success && userResponse?.payload) {
              localStorage.setItem("user_principal", JSON.stringify(userResponse.payload));
              dispatch(setUserPrincipal(userResponse.payload));
            }
          } catch (userError) {
            console.error("Error fetching user info:", userError);
          }
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

        // 7. Redirect hoặc điều hướng đến trang chủ (sau 1.5 giây để người dùng thấy toast)
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 1500);
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

  // Khởi tạo Google Sign-In
  useEffect(() => {
    const initGoogleSignIn = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: "68579606375-81dniafrmf0ab2p2s7amdsaala52jo48.apps.googleusercontent.com",
          callback: handleGoogleSignIn,
        });
      } else {
        // Retry after a short delay if Google SDK hasn't loaded yet
        setTimeout(initGoogleSignIn, 100);
      }
    };
    initGoogleSignIn();
  }, []);

  // Xử lý Google Sign-In callback
  const handleGoogleSignIn = async (response) => {
    setIsGoogleLoading(true);
    try {
      // Gửi credential (ID token) lên backend
      const loginResponse = await loginService.googleLogin(response.credential);

      if (loginResponse.success) {
        const token = loginResponse.token || loginResponse.data?.token;
        const userPrincipal = loginResponse.user || loginResponse.data?.user;

        // Lưu token vào localStorage
        localStorage.setItem("token", token);
        dispatch(setToken(token));

        // Lưu user_principal vào localStorage và Redux
        if (userPrincipal) {
          localStorage.setItem("user_principal", JSON.stringify(userPrincipal));
          dispatch(setUserPrincipal(userPrincipal));
        } else {
          // Fallback: Nếu không có user trong response, gọi API để lấy
          try {
            const userResponse = await dispatch(currentUser());
            if (userResponse?.success && userResponse?.payload) {
              localStorage.setItem("user_principal", JSON.stringify(userResponse.payload));
              dispatch(setUserPrincipal(userResponse.payload));
            }
          } catch (userError) {
            console.error("Error fetching user info:", userError);
          }
        }

        toast.success("Đăng nhập bằng Google thành công!", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        setTimeout(() => {
          navigate("/", { replace: true });
        }, 1500);
      } else {
        toast.error(loginResponse.message || "Đăng nhập bằng Google thất bại. Vui lòng thử lại.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("Đã có lỗi xảy ra khi đăng nhập bằng Google. Vui lòng thử lại.", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleLogin = (provider) => {
    if (provider === "Gmail" || provider === "Google") {
      // Trigger Google Sign-In popup
      if (window.google && window.google.accounts) {
        window.google.accounts.id.prompt();
      } else {
        toast.error("Google Sign-In chưa sẵn sàng. Vui lòng tải lại trang.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } else {
      alert(`Bạn đã chọn đăng nhập bằng ${provider}`);
      // Thêm logic xử lý đăng nhập tại đây
    }
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
          <h1>CLOTHES-FASHION</h1>
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
            <Link to="/forgot-password" className="forgot-password-link">
              Quên mật khẩu?
            </Link>
          </div>

          <div className="login-3rd">
            <button
              className="login-button"
              onClick={() => handleLogin("Gmail")}
              style={{ backgroundColor: "#db4437" }}
              disabled={isGoogleLoading}
            >
              <FontAwesomeIcon icon={faGoogle} style={{ marginRight: "10px" }} />
              {isGoogleLoading ? "Đang đăng nhập..." : "Google"}
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
