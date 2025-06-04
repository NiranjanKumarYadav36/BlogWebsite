import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import AxiosClient from "../ApiClient/AxiosClient";
import { Toaster } from "react-hot-toast";

const AdminProtectedRoutes = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        let isMounted = true; // Prevents state update if unmounted

        const checkToken = async () => {
            try {
                console.log("Checking authentication...");
                const response = await AxiosClient.get("/protected", { withCredentials: true });

                if (isMounted) {
                    const role = response.data.user; // Ensure backend returns role
                    setIsAuthenticated(response.status === 200 && role === "admin");
                }
            } catch (error) {
                if (isMounted) {
                    setIsAuthenticated(false);
                }
                console.error("Authentication check failed:", error);
            }
        };

        checkToken();

        return () => {
            isMounted = false; // Cleanup to prevent memory leaks
        };
    }, []);

    if (isAuthenticated === null) {
        return (
            <>
                <Toaster position="top-center" />
                <h1 className="text-center text-xl font-semibold">Checking authentication...</h1>
            </>
        );
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default AdminProtectedRoutes;