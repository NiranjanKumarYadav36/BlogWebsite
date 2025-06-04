import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import AxiosClient from "../ApiClient/AxiosClient";

const PublicRoutes = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        const checkToken = async () => {
            try {
                const response = await AxiosClient.get("/protected", { withCredentials: true });
                if (response.status === 200) {
                    setUserRole(response.data.user);
                    setIsAuthenticated(true);
                }
            } catch {
                setIsAuthenticated(false);
                setUserRole(null);
            }
        };
        checkToken();
    }, []);

    if (isAuthenticated === null) {
        return <h1 className="text-center text-xl font-semibold">Checking authentication...</h1>;
    }

    // Redirect based on role
    if (isAuthenticated && userRole === "admin") {
        return <Navigate to="/admin/dashbboard" />;
    }

    if (isAuthenticated && userRole === "user") {
        return <Navigate to="/blogs" />;
    }

    // Show public content (like login, register, etc.)
    return <Outlet />;
};

export default PublicRoutes;