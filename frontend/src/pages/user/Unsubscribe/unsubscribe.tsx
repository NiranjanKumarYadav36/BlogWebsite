import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import AxiosClient from "../../../components/ApiClient/AxiosClient";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";

export default function UnsubscribePage() {
    const [searchParams] = useSearchParams();
    const emailParam = searchParams.get("email");
    const [status, setStatus] = useState("pending");
    const navigate = useNavigate();

    useEffect(() => {
        const processUnsubscribe = async () => {
            try {
                const authResponse = await AxiosClient.get("/protected", { withCredentials: true });

                // ✅ Logged-in user
                const userEmail = authResponse.data.email;
                
                const role = authResponse.data.user;

                // Try to unsubscribe using their actual email
                await AxiosClient.get(`/newsletter/unsubscribe?email=${encodeURIComponent(userEmail)}`);

                // Optional: delay and redirect after a second
                setTimeout(() => {
                    if (role === "admin") {
                        window.location.href = "/admin/dashbboard";
                    } else {
                        window.location.href = "/blogs";
                    }
                }, 2000);
            } catch (authError) {
                // ❌ Not logged in — proceed using query param email
                if (!emailParam) {
                    setStatus("error");
                    return;
                }

                try {
                    const response = await AxiosClient.get(`/newsletter/unsubscribe?email=${encodeURIComponent(emailParam)}`);
                    if (response.status === 201) {
                        setStatus("success");
                    } else {
                        setStatus("error");
                    }
                } catch (error) {
                    setStatus("error");
                }
            }
        };

        processUnsubscribe();
    }, [emailParam, navigate]);

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <Card className="max-w-md w-full p-6 shadow-lg rounded-xl bg-white">
                <CardContent>
                    {status === "pending" && <p className="text-gray-700">Processing your request...</p>}
                    {status === "success" && (
                        <>
                            <h2 className="text-xl font-bold text-red-600">You've been unsubscribed</h2>
                            <p className="mt-2 text-gray-600">You will no longer receive our emails.</p>
                        </>
                    )}
                    {status === "error" && (
                        <>
                            <h2 className="text-xl font-bold text-red-600">Error</h2>
                            <p className="mt-2 text-gray-600">There was an issue processing your request.</p>
                        </>
                    )}
                    <Button className="mt-4" onClick={() => window.location.href = "/"}>Return to Website</Button>
                </CardContent>
            </Card>
        </div>
    );
}