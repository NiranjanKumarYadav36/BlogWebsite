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
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <Toaster position='top-center'/>
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

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default AdminProtectedRoutes;