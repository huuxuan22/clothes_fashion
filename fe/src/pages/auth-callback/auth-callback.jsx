import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { currentUser, setToken, setUserPrincipal } from "../../redux/User/Action";
import "./auth-callback.css";

/**
 * AuthCallback - Trang xử lý callback sau khi đăng nhập OAuth2 (Facebook, Google)
 * 
 * LUỒNG HOẠT ĐỘNG:
 * 1. Backend redirect về: http://localhost:3000/auth/callback?token=xxx
 * 2. Component này lấy token từ URL
 * 3. Lưu token vào localStorage và Redux
 * 4. Gọi API để lấy thông tin user
 * 5. Lưu user vào localStorage và Redux
 * 6. Redirect về trang chủ
 */
const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Lấy token từ URL query parameter
                const token = searchParams.get("token");

                if (!token) {
                    setError("Không tìm thấy token. Vui lòng thử lại.");
                    toast.error("Không tìm thấy token. Vui lòng thử lại.", {
                        position: "top-right",
                        autoClose: 3000,
                    });
                    setTimeout(() => {
                        navigate("/login", { replace: true });
                    }, 2000);
                    return;
                }

                // Lưu token vào localStorage
                localStorage.setItem("token", token);
                dispatch(setToken(token));

                // Gọi API để lấy thông tin user
                try {
                    const userResponse = await dispatch(currentUser());
                    if (userResponse?.success && userResponse?.payload) {
                        // Lưu user vào localStorage và Redux
                        localStorage.setItem("user_principal", JSON.stringify(userResponse.payload));
                        dispatch(setUserPrincipal(userResponse.payload));

                        toast.success("Đăng nhập thành công!", {
                            position: "top-right",
                            autoClose: 2000,
                        });

                        // Redirect về trang chủ sau 1.5 giây
                        setTimeout(() => {
                            navigate("/", { replace: true });
                        }, 1500);
                    } else {
                        throw new Error("Không thể lấy thông tin user");
                    }
                } catch (userError) {
                    console.error("Error fetching user info:", userError);
                    setError("Không thể lấy thông tin user. Vui lòng thử lại.");
                    toast.error("Không thể lấy thông tin user. Vui lòng thử lại.", {
                        position: "top-right",
                        autoClose: 3000,
                    });
                    setTimeout(() => {
                        navigate("/login", { replace: true });
                    }, 2000);
                }
            } catch (error) {
                console.error("Auth callback error:", error);
                setError("Đã có lỗi xảy ra. Vui lòng thử lại.");
                toast.error("Đã có lỗi xảy ra. Vui lòng thử lại.", {
                    position: "top-right",
                    autoClose: 3000,
                });
                setTimeout(() => {
                    navigate("/login", { replace: true });
                }, 2000);
            } finally {
                setIsLoading(false);
            }
        };

        handleCallback();
    }, [searchParams, navigate, dispatch]);

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
            <div className="auth-callback-container">
                {isLoading ? (
                    <div className="auth-callback-loading">
                        <div className="spinner"></div>
                        <p>Đang xử lý đăng nhập...</p>
                    </div>
                ) : error ? (
                    <div className="auth-callback-error">
                        <p>{error}</p>
                        <p>Đang chuyển hướng về trang đăng nhập...</p>
                    </div>
                ) : (
                    <div className="auth-callback-success">
                        <div className="success-icon">✓</div>
                        <p>Đăng nhập thành công!</p>
                        <p>Đang chuyển hướng...</p>
                    </div>
                )}
            </div>
        </>
    );
};

export default AuthCallback;



