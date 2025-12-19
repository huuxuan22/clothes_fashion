import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Typography,
  Divider,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Google, Facebook } from "@mui/icons-material";
import { FaTiktok } from "react-icons/fa";
import * as loginService from "./../../service/login-service";
import { useNavigate } from "react-router-dom";
import { CircularProgress, Backdrop } from "@mui/material";
const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  // Validation schema with Yup
  const validationSchema = Yup.object().shape({
    gender: Yup.string().required("Giới tính không được để trống"),
    numberphone: Yup.string()
      .required("Số điện thoại không được để trống")
      .matches(/^(0[3|5|7|8|9])+([0-9]{8})$/, "Số điện thoại không hợp lệ"),

    fullName: Yup.string()
      .required("Họ và tên không được để trống")
      .min(2, "Họ và tên phải có ít nhất 2 ký tự"),

    birthday: Yup.date()
      .nullable()
      .transform((value, originalValue) => {
        // Kiểm tra và chuyển đổi giá trị thành Timestamp (định dạng dd-MM-yyyy)
        if (originalValue === "") return null; // Nếu không có giá trị, trả về null
        const formattedDate = new Date(originalValue);
        // Đảm bảo ngày sinh là trong quá khứ
        if (formattedDate >= new Date()) {
          return new Yup.ValidationError(
            "Ngày sinh phải là một ngày trong quá khứ"
          );
        }
        return formattedDate;
      })
      .required("Ngày sinh không được để trống")
      .test("age", "Bạn phải từ 18 tuổi trở lên", (value) => {
        if (!value) return false;
        const today = new Date();
        const birthDate = new Date(value);
        const age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        return age > 18 || (age === 18 && m >= 0);
      }),

    username: Yup.string()
      .required("Tên đăng nhập không được để trống")
      .min(5, "Tên đăng nhập phải có ít nhất 5 ký tự")
      .max(20, "Tên đăng nhập không được quá 20 ký tự"),

    password: Yup.string()
      .required("Mật khẩu không được để trống")
      .min(6, "Mật khẩu phải ít nhất 6 ký tự"),

    email: Yup.string()
      .email("Email không hợp lệ")
      .required("Email không được để trống"),

    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Xác nhận mật khẩu không khớp")
      .required("Xác nhận mật khẩu không được để trống"),
  });

  const {
    register,
    setError,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });
  const [isSubmitting, setIsSubmitting] = useState(false); // Trạng thái để theo dõi việc submit
  const formatBirthday = (birthday) => {
    const date = new Date(birthday);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Lưu ý: tháng trong JavaScript bắt đầu từ 0
    const year = date.getFullYear();
    return `${day}-${month}-${year}`; // Định dạng dd-MM-yyyy
  };
  const onSubmit = async (formData) => {
    const formattedBirthday = formatBirthday(formData.birthday);
    formData.birthday = formattedBirthday;
    if (isSubmitting) return; // Nếu đang submit, không cho phép submit lại
    setIsSubmitting(true); // Đặt trạng thái là đang submit
    try {
      console.log("Bắt đầu đăng ký với dữ liệu:", formData);
      // Lưu email để truyền sang verify-code page
      const userEmail = formData.email;

      const response = await loginService.register(formData);
      console.log("Response từ API:", response);

      if (!response.success) {
        console.log("Đăng ký thất bại:", response.data);
        if (response.data.fullName) {
          setError("fullName", {
            type: "manual",
            message: response.data.fullName, // Gán thông báo lỗi từ API
          });
        } else if (response.data.gender) {
          setError("gender", {
            type: "manual",
            message: response.data.gender, // Gán thông báo lỗi từ API
          });
        } else if (response.data.numberphone) {
          setError("numberphone", {
            type: "manual",
            message: response.data.numberphone, // Gán thông báo lỗi từ API
          });
        } else if (response.data.birthday) {
          setError("birthday", {
            type: "manual",
            message: response.data.birthday, // Gán thông báo lỗi từ API
          });
        } else if (response.data.password) {
          setError("password", {
            type: "manual",
            message: response.data.password, // Gán thông báo lỗi từ API
          });
        } else if (response.data.email) {
          setError("email", {
            type: "manual",
            message: response.data.email, // Gán thông báo lỗi từ API
          });
        } else if (response.data.username) {
          setError("username", {
            type: "manual",
            message: response.data.username, // Gán thông báo lỗi từ API
          });
        }
      } else {
        console.log("Đăng ký thành công, chuyển đến trang verify-code với email:", userEmail);
        // Chỉ truyền email từ form data thay vì toàn bộ userDTO
        navigate("/verify-code", { state: { email: userEmail } });
      }
    } catch (error) {
      console.error("Lỗi khi đăng ký:", error);
      // Hiển thị thông báo lỗi chung nếu có lỗi không mong đợi
      setError("email", {
        type: "manual",
        message: "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePassword = () => setShowPassword(!showPassword);
  const handleToggleConfirmPassword = () =>
    setShowConfirmPassword(!showConfirmPassword);

  return (
    <Box
      sx={{
        position: "relative",
        height: "100vh",
        width: "100%",
        overflow: "hidden",
      }}
    >
      {/* Background Image */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage:
            "url(https://watermark.lovepik.com/photo/20211124/large/lovepik-fashion-womens-summer-shopping-image-picture_500961857.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.7)",
        }}
      />

      {/* Form Container */}
      <Container
        maxWidth="sm"
        sx={{
          position: "relative",
          height: "100%",
          display: "flex",
          alignItems: "center",
          zIndex: 1,
          py: 2,
        }}
      >
        <Paper
          elevation={6}
          sx={{
            p: 2.5,
            width: "100%",
            maxWidth: "550px",
            margin: "0 auto",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(5px)",
            maxHeight: "95vh",
            overflowY: "auto",
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-track": {
              background: "#f1f1f1",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#009F85",
              borderRadius: "3px",
            },
          }}
        >
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Typography variant="h6" sx={{ color: "#009F85", fontWeight: "bold", fontSize: "20px" }}>
              Đăng ký tài khoản
            </Typography>
          </Box>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={1.5}>
              {/* Full Name */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Họ và tên"
                  variant="outlined"
                  size="small"
                  {...register("fullName")}
                  error={!!errors.fullName}
                  helperText={errors.fullName?.message}
                  FormHelperTextProps={{
                    sx: { fontSize: "12px", margin: "4px 0 0 0" }
                  }}
                />
              </Grid>

              {/* Gender and Birthday */}
              <Grid item xs={12} sm={6}>
                <FormControl component="fieldset" fullWidth>
                  <FormLabel component="legend" sx={{ color: "#009F85", fontSize: "14px", mb: 0.5 }}>
                    Giới tính
                  </FormLabel>
                  <RadioGroup row>
                    <FormControlLabel
                      value="female"
                      control={
                        <Radio
                          size="small"
                          sx={{ color: "#009F85", "&.Mui-checked": { color: "#009F85" } }}
                          {...register("gender")}
                        />
                      }
                      label="Nữ"
                      labelPlacement="end"
                      sx={{ fontSize: "14px" }}
                    />
                    <FormControlLabel
                      value="male"
                      control={
                        <Radio
                          size="small"
                          sx={{ color: "#009F85", "&.Mui-checked": { color: "#009F85" } }}
                          defaultChecked
                          {...register("gender")}
                        />
                      }
                      label="Nam"
                      labelPlacement="end"
                      sx={{ fontSize: "14px" }}
                    />
                  </RadioGroup>
                  {errors.gender && (
                    <Typography variant="caption" color="error" sx={{ fontSize: "12px", display: "block", mt: 0.5 }}>
                      {errors.gender.message}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Ngày sinh"
                  type="date"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  {...register("birthday")}
                  error={!!errors.birthday}
                  helperText={errors.birthday?.message}
                  FormHelperTextProps={{
                    sx: { fontSize: "12px", margin: "4px 0 0 0" }
                  }}
                />
              </Grid>

              {/* Email and Phone */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  variant="outlined"
                  size="small"
                  {...register("email")}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  FormHelperTextProps={{
                    sx: { fontSize: "12px", margin: "4px 0 0 0" }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Số điện thoại"
                  variant="outlined"
                  size="small"
                  {...register("numberphone")}
                  error={!!errors.numberphone}
                  helperText={errors.numberphone?.message}
                  FormHelperTextProps={{
                    sx: { fontSize: "12px", margin: "4px 0 0 0" }
                  }}
                />
              </Grid>

              {/* Username */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Username"
                  variant="outlined"
                  size="small"
                  {...register("username")}
                  error={!!errors.username}
                  helperText={errors.username?.message}
                  FormHelperTextProps={{
                    sx: { fontSize: "12px", margin: "4px 0 0 0" }
                  }}
                />
              </Grid>

              {/* Password */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Mật khẩu"
                  type={showPassword ? "text" : "password"}
                  variant="outlined"
                  size="small"
                  {...register("password")}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  FormHelperTextProps={{
                    sx: { fontSize: "12px", margin: "4px 0 0 0" }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleTogglePassword}
                          edge="end"
                          size="small"
                          sx={{ color: "#009F85" }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Confirm Password */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Xác nhận mật khẩu"
                  type={showConfirmPassword ? "text" : "password"}
                  variant="outlined"
                  size="small"
                  {...register("confirmPassword")}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  FormHelperTextProps={{
                    sx: { fontSize: "12px", margin: "4px 0 0 0" }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleToggleConfirmPassword}
                          edge="end"
                          size="small"
                          sx={{ color: "#009F85" }}
                        >
                          {showConfirmPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12} sx={{ mt: 1 }}>
                <Button
                  type="submit"
                  fullWidth
                  disabled={isSubmitting}
                  variant="contained"
                  sx={{
                    py: 1.2,
                    fontSize: "16px",
                    fontWeight: "bold",
                    backgroundColor: "#009F85",
                    "&:hover": { backgroundColor: "#007A66" },
                  }}
                >
                  {isSubmitting ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Đăng ký"
                  )}
                </Button>
              </Grid>

              {/* Social Login */}
              <Grid item xs={12} sx={{ mt: 0.5 }}>
                <Divider sx={{ my: 1.5, fontSize: "14px" }}>Hoặc đăng nhập bằng</Divider>
                <Box sx={{ display: "flex", justifyContent: "center", gap: 1.5 }}>
                  <IconButton
                    size="small"
                    onClick={() => alert("Đăng nhập bằng Google")}
                    sx={{ color: "#DB4437", border: "1px solid #DB4437" }}
                  >
                    <Google fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => alert("Đăng nhập bằng Facebook")}
                    sx={{ color: "#4267B2", border: "1px solid #4267B2" }}
                  >
                    <Facebook fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => alert("Đăng nhập bằng TikTok")}
                    sx={{ color: "#000", border: "1px solid #000" }}
                  >
                    <FaTiktok size={16} />
                  </IconButton>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
      <Backdrop
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
        open={isSubmitting}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
};

export default Register;
