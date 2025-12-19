import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const AdminProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    const userPrincipalStr = localStorage.getItem("user_principal");
    const { users } = useSelector((store) => store);

    // Kiểm tra đã đăng nhập chưa
    const isAuthenticated = token || userPrincipalStr || users?.token || users?.user_principal;

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    // Lấy user principal từ localStorage hoặc Redux
    let userPrincipal = null;
    try {
        if (userPrincipalStr) {
            userPrincipal = JSON.parse(userPrincipalStr);
        } else if (users?.user_principal) {
            userPrincipal = typeof users.user_principal === 'string'
                ? JSON.parse(users.user_principal)
                : users.user_principal;
        } else if (users?.currentUser) {
            userPrincipal = users.currentUser;
        }
    } catch (error) {
        console.error("Error parsing user_principal:", error);
    }

    // Kiểm tra role - hỗ trợ nhiều format
    let userRole = null;
    if (userPrincipal?.role) {
        // Format: {role: {roleId: 1, roleName: "ADMIN"}}
        userRole = userPrincipal.role.roleName || userPrincipal.role;
    } else if (userPrincipal?.roleName) {
        // Format: {roleName: "ADMIN"}
        userRole = userPrincipal.roleName;
    }

    // Chỉ cho phép ADMIN truy cập
    if (userRole !== "ADMIN") {
        // Redirect đến trang 403 với thông báo lỗi
        return <Navigate to="/403?message=bạn đang ở ngoài phạm vi sử dụng" replace />;
    }

    return children;
};

export default AdminProtectedRoute;

