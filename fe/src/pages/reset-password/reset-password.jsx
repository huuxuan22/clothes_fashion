import { useForm } from "react-hook-form";
import "./reset-password.css";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as loginService from "../../service/login-service";
import { useDispatch } from "react-redux";
import { setToken, setUserPrincipal } from "../../redux/User/Action";
import { currentUser } from "../../redux/User/Action";

const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const email = location.state?.email || "";
    const code = location.state?.code || "";

    const validationSchema = Yup.object().shape({
        newPassword: Yup.string()
            .required("Vui lòng nhập mật khẩu mới")
            .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref("newPassword"), null], "Xác nhận mật khẩu không khớp")
            .required("Vui lòng xác nhận mật khẩu"),
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(validationSchema),
    });

    const onSubmit = async (data) => {
        if (!email || !code) {
            toast.error("Thông tin không hợp lệ. Vui lòng thử lại.", {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await loginService.resetPassword(email, code, data.newPassword);

            if (!response.success) {
                toast.error(response.data || "Có lỗi xảy ra. Vui lòng thử lại sau!", {
                    position: "top-right",
                    autoClose: 3000,
                });
                return;
            }

            // Reset password thành công - lưu token và user info
            const jwtToken = response.token || response.data;
            localStorage.setItem("token", jwtToken);
            dispatch(setToken(jwtToken));

            // Lấy thông tin user và lưu vào Redux
            try {
                const userResponse = await dispatch(currentUser());
                if (userResponse?.payload) {
                    localStorage.setItem("user_principal", JSON.stringify(userResponse.payload));
                    dispatch(setUserPrincipal(userResponse.payload));
                }
            } catch (userError) {
                console.error("Error fetching user info:", userError);
            }

            // Hiển thị thông báo thành công
            toast.success("Đặt lại mật khẩu thành công!", {
                position: "top-right",
                autoClose: 3000,
            });

            // Chuyển hướng về trang chủ
            setTimeout(() => {
                navigate("/");
            }, 2000);
        } catch (error) {
            console.error("Reset password error:", error);
            toast.error("Có lỗi xảy ra. Vui lòng thử lại sau!", {
                position: "top-right",
                autoClose: 3000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
            <div className="reset-password-page">
                <img
                    src="https://watermark.lovepik.com/photo/20211124/large/lovepik-fashion-womens-summer-shopping-image-picture_500961857.jpg"
                    alt="background"
                    className="background-image"
                />
                <div className="form-reset-password">
                    <h1>PTRAN-FASHION</h1>
                    <p>Đặt lại mật khẩu mới</p>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <input
                            type="password"
                            placeholder="Mật khẩu mới"
                            {...register("newPassword")}
                            disabled={isLoading}
                        />
                        {errors.newPassword && (
                            <div className="error-message">
                                <p>{errors.newPassword.message}</p>
                            </div>
                        )}
                        <input
                            type="password"
                            placeholder="Xác nhận mật khẩu mới"
                            {...register("confirmPassword")}
                            disabled={isLoading}
                        />
                        {errors.confirmPassword && (
                            <div className="error-message">
                                <p>{errors.confirmPassword.message}</p>
                            </div>
                        )}
                        <button type="submit" disabled={isLoading}>
                            {isLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                        </button>
                    </form>
                    <div className="back-to-login">
                        <Link to="/login">Quay lại đăng nhập</Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ResetPassword;

