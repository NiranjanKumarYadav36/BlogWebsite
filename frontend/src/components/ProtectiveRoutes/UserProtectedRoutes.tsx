import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import AxiosClient from "../ApiClient/AxiosClient";
import { Toaster } from "react-hot-toast";

const UserProtectedRoutes = () => {
    const [role, setRole] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        let isMounted = true;

        const checkToken = async () => {
            try {
                const response = await AxiosClient.get("/protected", { withCredentials: true });

                if (isMounted) {
                    const userRole = response.data.user;
                    setRole(userRole);
                    setIsAuthenticated(response.status === 200);
                }
            } catch (error) {
                if (isMounted) {
                    setIsAuthenticated(false);
                }
                console.error("Authentication check failed:", error);
            }
        };

        checkToken();
        return () => { isMounted = false; };
    }, []);

    if (isAuthenticated === null) {
        return (
            <>
                <Toaster position="top-center" />
                <h1 className="text-center text-xl font-semibold">Checking authentication...</h1>
            </>
        );
    }

    // Redirect Admin to Admin Page
    if (isAuthenticated && role === "admin") {
        return <Navigate to="/admin/homepage" />;
    }

    // Redirect Unauthorized Users to Login
    return isAuthenticated && role === "user" ? <Outlet /> : <Navigate to="/login" />;
};

export default UserProtectedRoutes;