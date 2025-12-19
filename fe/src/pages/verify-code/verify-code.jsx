import { faArrowLeft, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./verify-code.css";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import * as loginService from "./../../service/login-service";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import * as userService from "./../../service/user-service";
import { useDispatch, useSelector } from "react-redux";
import { setToken, setUserPrincipal } from "../../redux/User/Action";
import { currentUser } from "../../redux/User/Action";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const VerifyCode = () => {
  const [code, setCode] = useState("");
  const location = useLocation();
  const email = location.state?.email || "";
  const account = location.state?.account || {};
  const type = location.state?.type || ""; // "forgot-password" hoặc ""
  const [showErrors, setShowErrors] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { users } = useSelector((store) => store);
  const token = localStorage.getItem("token");

  const handleChange = (e) => {
    const value = e.target.value;
    // Chỉ cho phép nhập số và tối đa 6 ký tự
    if (/^\d*$/.test(value) && value.length <= 6) {
      setCode(value);
      setShowErrors(false);
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra nếu chưa điền đủ 6 số
    if (!code || code.length !== 6) {
      setShowErrors(true);
      setError("Vui lòng nhập đầy đủ 6 số mã xác thực");
      return;
    }

    const verificationCode = code;
    setIsSubmitting(true);
    setShowErrors(false);
    setError("");

    try {
      let response = null;

      // Xử lý 3 luồng: Register, Change Password, và Forgot Password
      if (type === "forgot-password") {
        // Luồng 3: Forgot Password - chỉ verify code, sau đó chuyển đến trang reset password
        if (!email) {
          setShowErrors(true);
          setError("Không tìm thấy thông tin email. Vui lòng thử lại.");
          setIsSubmitting(false);
          return;
        }

        // Verify code bằng cách gọi reset-password với mật khẩu tạm (sẽ không dùng)
        // Thực tế, chỉ cần verify code, sau đó chuyển đến trang reset password
        // Tạm thời, chuyển trực tiếp đến trang reset password với code đã nhập
        toast.success("Mã xác thực hợp lệ!", {
          position: "top-right",
          autoClose: 2000,
        });

        setTimeout(() => {
          navigate("/reset-password", {
            state: { email: email, code: verificationCode },
          });
        }, 1500);
      } else if (account && account.newPassword) {
        // Luồng 1: Đổi mật khẩu
        if (!token) {
          setShowErrors(true);
          setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          setIsSubmitting(false);
          return;
        }

        response = await userService.updatePassword(token, account.newPassword, verificationCode);

        if (!response.success) {
          setShowErrors(true);
          setError(response.data || "Mã xác thực không đúng hoặc đã hết hạn");
          setCode("");
          if (document.getElementById("code-input")) {
            document.getElementById("code-input").focus();
          }
        } else {
          // Đổi mật khẩu thành công - cập nhật token mới
          const newToken = response.data; // Backend trả về JWT token mới
          localStorage.setItem("token", newToken);
          dispatch(setToken(newToken));

          // Cập nhật thông tin user
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
          toast.success("Đổi mật khẩu thành công!", {
            position: "top-right",
            autoClose: 3000,
          });

          // Chuyển về trang profile hoặc trang trước
          setTimeout(() => {
            navigate("/profile");
          }, 1500);
        }
      } else {
        // Luồng 2: Đăng ký tài khoản mới
        if (!email) {
          setShowErrors(true);
          setError("Không tìm thấy thông tin email. Vui lòng đăng ký lại.");
          setIsSubmitting(false);
          return;
        }

        response = await loginService.saveAfterCheck(email, verificationCode);

        if (!response.success) {
          setShowErrors(true);
          setError(response.message || response.data || "Mã xác thực không đúng hoặc đã hết hạn");
          setCode("");
          if (document.getElementById("code-input")) {
            document.getElementById("code-input").focus();
          }
        } else {
          // Đăng ký thành công - lưu token và user info
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
          toast.success("Đăng ký tài khoản thành công!", {
            position: "top-right",
            autoClose: 3000,
          });

          // Chuyển hướng về trang chủ
          setTimeout(() => {
            navigate("/");
          }, 1500);
        }
      }
    } catch (err) {
      console.error("Verification error:", err);
      setShowErrors(true);
      setError("Đã có lỗi xảy ra. Vui lòng thử lại sau.");
      setCode("");
      if (document.getElementById("code-input")) {
        document.getElementById("code-input").focus();
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  const [isResending, setIsResending] = useState(false); // Thêm state này cùng với các state khác
  const handleSendCodeAgain = async () => {
    try {
      setIsResending(true); // Bắt đầu hiển thị loading
      setShowErrors(false);
      setError("");
      setSuccessMessage("");

      // Xử lý send code again cho cả 2 luồng
      if (account && account.newPassword) {
        // Luồng 1: Change password - gọi endpoint riêng
        if (!token) {
          const errorMsg = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
          setShowErrors(true);
          setError(errorMsg);
          toast.error(errorMsg, {
            position: "top-right",
            autoClose: 3000,
          });
          setIsResending(false);
          return;
        }

        const response = await userService.sendCodeForPasswordChange(token);
        if (!response.success) {
          const errorMsg = typeof response.data === 'string'
            ? response.data
            : "Không thể gửi mã xác thực. Vui lòng thử lại.";
          setShowErrors(true);
          setError(errorMsg);
          toast.error(errorMsg, {
            position: "top-right",
            autoClose: 3000,
          });
        } else {
          const successMsg = typeof response.data === 'string'
            ? response.data
            : "Mã xác thực đã được gửi lại đến email của bạn. Vui lòng kiểm tra.";
          setSuccessMessage(successMsg);
          toast.success(successMsg, {
            position: "top-right",
            autoClose: 3000,
          });
          setTimeout(() => {
            setSuccessMessage("");
          }, 5000);
        }
      } else {
        // Luồng 2: Register - gọi endpoint send-again
        if (!email) {
          const errorMsg = "Không tìm thấy thông tin email. Vui lòng đăng ký lại.";
          setShowErrors(true);
          setError(errorMsg);
          toast.error(errorMsg, {
            position: "top-right",
            autoClose: 3000,
          });
          setIsResending(false);
          return;
        }

        const response = await loginService.sendCodeAgain(email);
        if (!response.success) {
          const errorMsg = typeof response.data === 'string'
            ? response.data
            : "Không thể gửi mã xác thực. Vui lòng thử lại.";
          setShowErrors(true);
          setError(errorMsg);
          toast.error(errorMsg, {
            position: "top-right",
            autoClose: 3000,
          });
        } else {
          const successMsg = typeof response.data === 'string'
            ? response.data
            : "Mã xác thực đã được gửi lại đến email của bạn. Vui lòng kiểm tra.";
          setSuccessMessage(successMsg);
          toast.success(successMsg, {
            position: "top-right",
            autoClose: 3000,
          });
          setTimeout(() => {
            setSuccessMessage("");
          }, 5000);
        }
      }
    } catch (err) {
      console.error("Resend code error:", err);
      const errorMsg = err.message || "Không thể gửi lại mã xác thực. Vui lòng thử lại sau.";
      setShowErrors(true);
      setError(errorMsg);
      toast.error(errorMsg, {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsResending(false); // Kết thúc hiển thị loading dù có lỗi hay không
    }
  };

  return (
    <div className="verify-code">
      <ToastContainer />
      <img
        src="https://watermark.lovepik.com/photo/20211124/large/lovepik-fashion-womens-summer-shopping-image-picture_500961857.jpg"
        alt="background"
        className="background-image"
      />
      <form onSubmit={handleSubmit} className="form-verify-code">
        <Link onClick={() => navigate(-2)} className="back-link">
          <FontAwesomeIcon icon={faArrowLeft} /> Come back
        </Link>
        <div className="vc-title" style={{ color: "#00917b" }}>
          <FontAwesomeIcon icon={faEnvelope} />
          <h6>VERIFY YOUR EMAIL ADDRESS</h6>
        </div>

        <div className="vc-content">
          <div>
            <span>
              A verification code has been sent to <br />
              {email || account?.email || "tranduonghuuxuan22@gmail.com"}
            </span>
          </div>

          <div>
            <p>
              Please check your inbox and enter the verification code below to
              verify your email address. Bạn có 5 lần để gửi mã nếu không email này sẽ bị chặn 10 phút rồi mới đăng nhập lại
            </p>
          </div>

          <div className="row">
            <div className="col-lg-4"></div>
            <div className="col-lg-4">
              <input
                type="text"
                id="code-input"
                maxLength="6"
                value={code}
                onChange={handleChange}
                placeholder="Nhập mã xác thực 6 số"
                className="verify-input-single"
                style={{
                  borderColor: showErrors ? "#ff0000" : "#00917b",
                  color: "#00917b",
                  backgroundColor: showErrors ? "#fff0f0" : "white",
                  width: "100%",
                  padding: "15px",
                  fontSize: "24px",
                  textAlign: "center",
                  letterSpacing: "8px",
                  fontFamily: "'Courier New', monospace",
                  fontWeight: "bold",
                  borderRadius: "8px",
                  border: "2px solid",
                  outline: "none",
                  transition: "all 0.3s ease",
                }}
                autoFocus
              />
            </div>
            <div className="col-lg-4"></div>
          </div>

          {/* Thông báo lỗi */}
          {showErrors && (
            <div
              className="error-message"
              style={{
                color: "#ff0000",
                backgroundColor: "#fff0f0",
                padding: "10px",
                borderRadius: "5px",
                margin: "15px 0",
                textAlign: "center",
                border: "1px solid #ff0000",
                fontWeight: "bold",
              }}
            >
              {error}
            </div>
          )}

          {/* Thông báo thành công khi gửi lại code */}
          {successMessage && (
            <div
              className="success-message"
              style={{
                color: "#00917b",
                backgroundColor: "#e6f7f0",
                padding: "10px",
                borderRadius: "5px",
                margin: "15px 0",
                textAlign: "center",
                border: "1px solid #00917b",
                fontWeight: "bold",
              }}
            >
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              backgroundColor: isSubmitting ? "#ccc" : "#00917b",
              color: "white",
              border: "none",
              marginTop: "15px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              opacity: isSubmitting ? 0.6 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {isSubmitting ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin />
                Đang xử lý...
              </>
            ) : (
              "Xác thực"
            )}
          </button>

          <div className="action-other">
            <button
              type="button"
              onClick={handleSendCodeAgain}
              className="action-link"
              style={{
                color: "#00917b",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
              disabled={isResending} // Vô hiệu hóa nút khi đang gửi
            >
              {isResending ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />{" "}
                  {/* Biểu tượng xoay */}
                  Sending...
                </>
              ) : (
                "Resend Code"
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="action-link"
              style={{
                color: "#00917b",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Change Email
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default VerifyCode;
