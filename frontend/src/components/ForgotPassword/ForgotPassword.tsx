import { useState } from "react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { useForm } from "react-hook-form";
import AxiosClient from "../ApiClient/AxiosClient";
import { Toaster, toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";


export default function ForgotPassword() {
    const [step, setStep] = useState<"email" | "otp" | "reset">("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();


    const {
        register,
        handleSubmit,
        setError,
    } = useForm();

    // Step 1: Send OTP to Email
    const handleSendOTP = async (data: any) => {
        setLoading(true);
        try {
            const response = await AxiosClient.post("/forgot_password", { 
                email: data.email 
            });
            
            if (response.status === 200) {
                setEmail(data.email);
                setStep("otp");
                toast.success(response.data.message || "OTP sent successfully");
            }
        } catch (error: any) {
            // Handle Axios error response
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                toast.error(error.response.data?.message || "Error sending OTP");
            } else if (error.request) {
                // The request was made but no response was received
                toast.error("No response from server");
            } else {
                // Something happened in setting up the request
                toast.error("Error setting up request");
            }
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOTP = async (data: any) => {
        setLoading(true)
        try {
            const response = await AxiosClient.post("/verify-otp", { email, otp: data.otp });
            setOtp(data.otp);
            setStep("reset");
            toast.success(response.data.message)
        } catch (error) {
            setError("otp", { message: "Invalid OTP" });
            setLoading(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (data: any) => {
        setLoading(true)
        try {
            const response = await AxiosClient.post("/reset-password", {
                email,
                otp,
                newPassword: data.password,
            });
            setStep("email");
            toast.success(response.data.message)
            navigate("/login")
        } catch (error) {
            setError("password", { message: "Error updating password" });
            setLoading(false)
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200">
            <Toaster position="top-center" />
            <div className="absolute top-4 left-4">
                <Link to="/" className="text-2xl font-bold text-[#1E40AF]">
                    MyBlog
                </Link>
            </div>
            <div className="p-6 bg-white shadow-md rounded-lg w-96">
                {step === "email" && (
                    <form onSubmit={handleSubmit(handleSendOTP)}>
                        <h2 className="text-xl font-semibold mb-4">Forgot Password</h2>
                        <Input
                            type="email"
                            placeholder="Enter your email"
                            {...register("email", { required: "Email is required" })}
                        />
                        <Button type="submit" className="mt-4 w-full" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin" size={20} /> : "Send OTP"}
                        </Button>
                    </form>
                )}

                {step === "otp" && (
                    <form onSubmit={handleSubmit(handleVerifyOTP)}>
                        <h2 className="text-xl font-semibold mb-4">Verify OTP</h2>
                        <Input
                            type="text"
                            placeholder="Enter OTP"
                            {...register("otp", { required: "OTP is required" })}
                        />
                        <Button type="submit" className="mt-4 w-full">
                            {loading ? <Loader2 className="animate-spin" size={20} /> : "Verify OTP"}
                        </Button>
                    </form>
                )}

                {step === "reset" && (
                    <form onSubmit={handleSubmit(handleResetPassword)}>
                        <h2 className="text-xl font-semibold mb-4">Reset Password</h2>
                        <Input
                            type="password"
                            placeholder="Enter new password"
                            {...register("password", { required: "Password is required" })}
                        />
                        <Button type="submit" className="mt-4 w-full">
                            {loading ? <Loader2 className="animate-spin" size={20} /> : "Reset Password"}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}