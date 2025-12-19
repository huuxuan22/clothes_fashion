import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, Typography, Button, Container } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

const Forbidden403 = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const errorMessage = searchParams.get("message");

    // Màu của project
    const primaryColor = "#009F85";
    const hoverColor = "#007A66";

    const handleGoBack = () => {
        // Kiểm tra xem có token không
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");

        if (token) {
            // Có token thì quay về trang chủ
            navigate("/");
        } else {
            // Không có token thì quay về trang đăng nhập
            navigate("/login");
        }
    };

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "100vh",
                    textAlign: "center",
                    padding: 4,
                }}
            >
                <LockOutlinedIcon
                    sx={{
                        fontSize: 120,
                        color: primaryColor,
                        mb: 3,
                    }}
                />

                <Typography
                    variant="h1"
                    component="h1"
                    sx={{
                        fontSize: { xs: "3rem", md: "5rem" },
                        fontWeight: "bold",
                        color: primaryColor,
                        mb: 2,
                    }}
                >
                    403
                </Typography>

                <Typography
                    variant="h4"
                    component="h2"
                    sx={{
                        mb: 2,
                        color: primaryColor,
                        fontWeight: 500,
                    }}
                >
                    Truy cập bị từ chối
                </Typography>

                <Typography
                    variant="body1"
                    sx={{
                        mb: 4,
                        color: "text.secondary",
                        maxWidth: "500px",
                        fontSize: "1.1rem",
                        fontWeight: errorMessage ? 500 : 400,
                    }}
                >
                    {errorMessage
                        ? errorMessage
                        : "Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi."}
                </Typography>

                <Button
                    variant="contained"
                    onClick={handleGoBack}
                    size="large"
                    sx={{
                        px: 4,
                        py: 1.5,
                        backgroundColor: primaryColor,
                        color: "white",
                        "&:hover": {
                            backgroundColor: hoverColor,
                        },
                        textTransform: "none",
                        fontWeight: 500,
                        fontSize: "1rem",
                    }}
                >
                    Quay lại
                </Button>
            </Box>
        </Container>
    );
};

export default Forbidden403;

