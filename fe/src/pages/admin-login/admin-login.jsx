import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faShieldAlt } from "@fortawesome/free-solid-svg-icons";
import "./admin-login.css";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as loginService from "../../service/login-service";
import { currentUser, setToken, setUserPrincipal } from "../../redux/User/Action";

const AdminLogin = () => {
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
                // Kiểm tra role của user
                const user = response.user || response.data?.user;
                const userRole = user?.role?.roleName || user?.role;

                // Kiểm tra nếu không phải ADMIN
                if (userRole !== "ADMIN") {
                    setError("username", {
                        type: "manual",
                        message: "Bạn không có quyền truy cập trang quản trị",
                    });
                    toast.error("Bạn không có quyền truy cập trang quản trị!", {
                        position: "top-right",
                        autoClose: 3000,
                    });
                    return;
                }

                // Đăng nhập thành công cho ADMIN
                const token = response.token || response.data?.token;
                const userPrincipal = response.user || response.data?.user;

                // 1. Lưu token vào localStorage
                localStorage.setItem("token", token);
                localStorage.setItem("isAdmin", "true"); // Đánh dấu là admin

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

                // 4. Hiển thị thông báo đăng nhập thành công
                toast.success("Đăng nhập quản trị thành công!", {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });

                // 5. Redirect đến trang admin
                setTimeout(() => {
                    navigate("/admin", { replace: true });
                }, 1500);
            } else {
                // Xử lý các loại lỗi khác nhau
                switch (response.errorType) {
                    case 'validation':
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
                        setError("password", {
                            type: "manual",
                            message: response.message || "Tài khoản hoặc mật khẩu không đúng.",
                        });
                        break;

                    case 'server':
                        toast.error(response.message || "Đã có lỗi xảy ra. Vui lòng thử lại sau.", {
                            position: "top-right",
                            autoClose: 3000,
                        });
                        break;

                    case 'network':
                        toast.error(response.message || "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.", {
                            position: "top-right",
                            autoClose: 3000,
                        });
                        break;

                    default:
                        toast.error(response.message || "Đã có lỗi xảy ra. Vui lòng thử lại.", {
                            position: "top-right",
                            autoClose: 3000,
                        });
                }
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.error("Đã có lỗi không mong đợi xảy ra. Vui lòng thử lại.", {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
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
            <div className="admin-login-page">
                <img
                    src="https://watermark.lovepik.com/photo/20211124/large/lovepik-fashion-womens-summer-shopping-image-picture_500961857.jpg"
                    alt="background"
                    className="background-image"
                />
                <div className="form-admin-login">
                    <div className="admin-header">
                        <FontAwesomeIcon icon={faShieldAlt} className="admin-icon" />
                        <h1>CLOTHES-FASHION</h1>
                        <p className="admin-subtitle">Trang quản trị hệ thống</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        {/* Username Field */}
                        <div className="username-field">
                            <input
                                type="text"
                                placeholder="Tên tài khoản quản trị"
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

                        <button type="submit" className="admin-login-button">
                            Đăng Nhập Quản Trị
                        </button>
                    </form>

                    <div className="admin-footer">
                        <Link to="/login" className="back-to-user-login">
                            ← Quay lại đăng nhập người dùng
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminLogin;

