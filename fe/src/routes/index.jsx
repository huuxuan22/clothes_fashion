import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

// Pages
import Login from "../pages/login/login.jsx";
import Register from "../pages/register/register.jsx";
import ChangePassword from "../pages/change-password/change-password.jsx";
import VerifyCode from "../pages/verify-code/verify-code.jsx";
import EnterEmailVerify from "../pages/enter-email-verify/enter-email-verify.jsx";
import HomePage from "../pages/home/HomePage.jsx";
import ProductPage from "../pages/ProductPage.jsx";
import ProductDetail from "../pages/product-detail/ProductDetail.jsx";
import UserProfile from "../pages/user-profile/UserProfile.jsx";
import ShoppingCart from "../component/cart/ShoppingCart.jsx";
import Search from "../component/Search.jsx";
import Introduce from "../pages/Introduce/Introduce.jsx";
import Contact from "../pages/contact/Contact.jsx";
import OrderSuccess from "../component/OrderSuccess.jsx";
import PaymentPage from "../pages/payment-page/PaymentPage.jsx";
import OrderDetailPage from "../pages/order-detail/OrderDetailPage.jsx";
import ProductComment from "../features/ProductComment.jsx";
import CategoryDropdown from "../features/CategoryDropdown.jsx";
import DealsSection from "../component/DealsSection.jsx";
import ShopByCategory from "../component/ShopByCategory.jsx";
import ProductCategory from "../component/ProductCategory.jsx";
import FashionGallery from "../component/FashionGallery.jsx";
import Footer from "../layout/Footer.jsx";
import Header from "../layout/Header.jsx";
import SideBarAdmin from "../component/SideBarAdmin.jsx";
import CouponDetailPage from "../pages/coupoun-detail/CouponDetail.jsx";
import CreateCollectionPage from "../component/CreateCollection.jsx";
import CollectionDetail from "../pages/collection-detail/CollectionDetail.jsx";
import PaymentResult from "../features/PaymentResult.jsx";
import Forbidden403 from "../pages/403/Forbidden403.jsx";
import ForgotPassword from "../pages/forgot-password/forgot-password.jsx";

/**
 * AppRoutes - Cấu hình tất cả các routes của ứng dụng
 */
const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes - Không cần đăng nhập */}

            {/* Routes chỉ dành cho user chưa đăng nhập (redirect nếu đã đăng nhập) */}
            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                }
            />
            <Route
                path="/register"
                element={
                    <PublicRoute>
                        <Register />
                    </PublicRoute>
                }
            />
            <Route
                path="/forgot-password"
                element={
                    <PublicRoute>
                        <ForgotPassword />
                    </PublicRoute>
                }
            />

            {/* Routes công khai - ai cũng truy cập được */}
            <Route path="/" element={<HomePage />} />
            <Route path="/403" element={<Forbidden403 />} />
            <Route path="/coupon-detail" element={<CouponDetailPage />} />
            <Route path="/collection-detail" element={<CollectionDetail />} />
            <Route path="/payment-result" element={<PaymentResult />} />
            <Route path="/shopping-cart" element={<ShoppingCart />} />
            <Route path="/search" element={<Search />} />
            <Route path="/introduce" element={<Introduce />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/product-detail" element={<ProductDetail />} />
            <Route path="/product-page" element={<ProductPage />} />
            <Route path="/drowdown" element={<CategoryDropdown />} />
            <Route path="/deal" element={<DealsSection />} />
            <Route path="/shop-by-cate" element={<ShopByCategory />} />
            <Route path="/footer" element={<Footer />} />
            <Route path="/product-category" element={<ProductCategory />} />
            <Route path="/gallery" element={<FashionGallery />} />
            <Route path="/header" element={<Header />} />

            {/* Protected Routes - Yêu cầu đăng nhập */}
            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <UserProfile />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/change-password"
                element={
                    <ProtectedRoute>
                        <ChangePassword />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/payment"
                element={
                    <ProtectedRoute>
                        <PaymentPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/order-detail"
                element={
                    <ProtectedRoute>
                        <OrderDetailPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/comment"
                element={
                    <ProtectedRoute>
                        <ProductComment />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/create-collection"
                element={
                    <ProtectedRoute>
                        <CreateCollectionPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin"
                element={
                    <ProtectedRoute>
                        <SideBarAdmin />
                    </ProtectedRoute>
                }
            />

            {/* Routes đặc biệt - có logic riêng */}
            <Route path="/verify-code" element={<VerifyCode />} />
            <Route path="/enter-email-verify" element={<EnterEmailVerify />} />
        </Routes>
    );
};

export default AppRoutes;

