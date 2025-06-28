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
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="relative w-20 h-20">
                    <div className="absolute w-6 h-6 bg-blue-500 rounded-full animate-bounce-slow left-0"></div>
                    <div className="absolute w-6 h-6 bg-red-500 rounded-full animate-bounce-mid left-6"></div>
                    <div className="absolute w-6 h-6 bg-green-500 rounded-full animate-bounce-fast left-12"></div>
                </div>
                <style>
                    {`
                    @keyframes bounceSlow {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-20px); }
                    }
                    @keyframes bounceMid {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-30px); }
                    }
                    @keyframes bounceFast {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-40px); }
                    }

                    .animate-bounce-slow {
                        animation: bounceSlow 1.5s infinite;
                    }
                    .animate-bounce-mid {
                        animation: bounceMid 1s infinite;
                    }
                    .animate-bounce-fast {
                        animation: bounceFast 0.75s infinite;
                    }
                `}
                </style>
            </div>
        );
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