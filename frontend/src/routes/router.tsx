import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/LoginPage/LoginPage";
import Register from "../pages/RegisterPage/RegisterPage";
import UserHomePage from "../pages/user/UserHomePage/UserHomePage";
import UserProtectedRoutes from "../components/ProtectiveRoutes/UserProtectedRoutes";
import AdminProtectedRoutes from "../components/ProtectiveRoutes/AdminProtectedRoutes"
import PublicRoutes from "../components/ProtectiveRoutes/PublicRoutes";
import PageNotFound from "../components/PageNotFound/PageNotFound";
import AdminDashBoard from "../pages/admin/AdminDashBoard/AdminDashBoard";
import UsersList from "../pages/admin/UsersList/UsersList";
import AddBlog from "../pages/admin/AddBlog/AddBlog";
import ManageBlogs from "../pages/admin/ManageBlogs/ManageBlogs";
import ShowBlog from "../pages/user/ShowBlog/ShowBlog";
import EditBlog from "../pages/admin/EditBlog/EditBlog";
import ContactPage from "../pages/user/ContactPage/ContatctPage";
import ForgotPassword from "../components/ForgotPassword/ForgotPassword";
import PublicHomePage from "../pages/user/UserHomePage/PublicHomePage";
import PublicShowPage from "../pages/user/ShowBlog/PublicShowPage";
import BlogStats from "../pages/admin/BlogStats/BlogStats";
import AddCategory from "../pages/admin/AddCategory/AddCategory";
import FilteredBlogUserHomePage from "../pages/user/UserHomePage/FilteredBlogs";
import UnsubscribePage from "../pages/user/Unsubscribe/unsubscribe";
import AddRequest from "../pages/user/AddRequest/addRequest";
import BlogRequest from "../pages/admin/BlogRequest/BlogRequest";

const AppRouter: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Publicly accessible to ALL (even logged-in users) */}
                <Route path="/unsubscribe" element={<UnsubscribePage />} />
                
                {/* Public Routes */}
                <Route element={<PublicRoutes />}>
                    <Route path="/public_blogs/:slug" element={<PublicShowPage />} />
                    <Route path="/" element={<PublicHomePage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/reset_password" element={<ForgotPassword />} />
                    {/* <Route path="/unsubscribe" element={<UnsubscribePage />} /> */}
                </Route>

                {/* User Protected Routes */}
                <Route element={<UserProtectedRoutes />}>
                    <Route path="/blogs" element={<UserHomePage />} />
                    <Route path="/blogs/:slug" element={<ShowBlog />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/filtered-blogs" element={<FilteredBlogUserHomePage />} />
                    <Route path="/make-request" element={<AddRequest/>}/>
                </Route>

                {/* Admin Protected Routes */}
                <Route element={<AdminProtectedRoutes />}>
                    <Route path="/admin/dashbboard" element={<AdminDashBoard />} />
                    <Route path="/admin/users_list" element={<UsersList />} />
                    <Route path="/admin/add_blog" element={<AddBlog />} />
                    <Route path="/admin/manage_blogs" element={<ManageBlogs />} />
                    <Route path="/admin/blog_stats/:slug" element={<BlogStats />} />
                    <Route path="/admin/edit_blog" element={<EditBlog />} />
                    <Route path="/admin/manage_categories" element={<AddCategory />} />
                    <Route path="/admin/blog_requests" element={<BlogRequest />}/>
                </Route>



                {/* Catch-all route for 404 */}
                <Route path="*" element={<PageNotFound />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;