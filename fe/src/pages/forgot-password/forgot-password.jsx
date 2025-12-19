import { useForm } from "react-hook-form";
import "./forgot-password.css";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as loginService from "../../service/login-service";

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const validationSchema = Yup.object().shape({
        email: Yup.string()
            .email("Email không đúng định dạng")
            .required("Vui lòng nhập email"),
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(validationSchema),
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            // Gọi API gửi mã xác thực đến email
            const response = await loginService.forgotPassword(data.email);

            if (!response.success) {
                toast.error(response.data || "Có lỗi xảy ra. Vui lòng thử lại sau!", {
                    position: "top-right",
                    autoClose: 3000,
                });
                return;
            }

            // Hiển thị thông báo thành công
            toast.success(response.data || "Mã xác thực đã được gửi đến email của bạn!", {
                position: "top-right",
                autoClose: 3000,
            });

            // Chuyển đến trang nhập mã xác thực
            setTimeout(() => {
                navigate("/verify-code", {
                    state: {
                        email: data.email,
                        type: "forgot-password"
                    },
                });
            }, 2000);
        } catch (error) {
            console.error("Forgot password error:", error);
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
            <div className="forgot-password-page">
                <img
                    src="https://watermark.lovepik.com/photo/20211124/large/lovepik-fashion-womens-summer-shopping-image-picture_500961857.jpg"
                    alt="background"
                    className="background-image"
                />
                <div className="form-forgot-password">
                    <h1>CLOTHES-FASHION</h1>
                    <p>Nhập email để đặt lại mật khẩu</p>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <input
                            type="email"
                            placeholder="Email của bạn"
                            {...register("email")}
                            disabled={isLoading}
                        />
                        {errors.email && (
                            <div className="error-message">
                                <p>{errors.email.message}</p>
                            </div>
                        )}
                        <button type="submit" disabled={isLoading}>
                            {isLoading ? "Đang gửi..." : "Gửi mã xác thực"}
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

export default ForgotPassword;

