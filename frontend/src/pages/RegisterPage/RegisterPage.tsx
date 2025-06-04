import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Loader2 } from "lucide-react";
import AxiosClient from "../../components/ApiClient/AxiosClient";
import { Toaster, toast } from "react-hot-toast";

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  otp?: string;
}

const Register = () => {
  const [formData, setFormData] = useState<RegisterFormData>({ 
    username: "", 
    email: "", 
    password: "" 
  });
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_BACKEND_URL_GOOGLE as string;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOTP = async () => {
    if (!formData.email) {
      toast.error("Email is required");
      return;
    }

    setOtpLoading(true);
    try {
      const response = await AxiosClient.post("/send-registration-otp", { 
        email: formData.email 
      });
      if (response.status === 200) {
        toast.success("OTP sent to your email");
        setOtpSent(true);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.username || !formData.email || !formData.password || !formData.otp) {
      setLoading(false);
      toast.error("Please enter all details");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const response = await AxiosClient.post("/register", formData);
      if (response.status === 201) {
        toast.success(response.data.message);
        navigate("/login");
      }
    } catch (err: any) {
      if (err.response) {
        toast.error(err.response?.data?.message || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      <Toaster position="top-center" />
      <div className="absolute top-4 left-4">
        <Link to="/" className="text-2xl font-bold text-[#1E40AF]">
          MyBlog
        </Link>
      </div>
      <Card className="w-full max-w-md p-8 rounded-xl mt-6 shadow-lg bg-white border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-center text-3xl font-bold text-blue-600">
            {otpSent ? "Verify OTP" : "Create Your Account"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {!otpSent ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    onChange={handleChange}
                    className="py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleSendOTP}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 shadow-md hover:shadow-lg"
                  disabled={otpLoading}
                >
                  {otpLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={20} />
                      Sending OTP...
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-700 font-medium">
                    Username
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Enter your username"
                    onChange={handleChange}
                    className="py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 font-medium">
                    Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="At least 6 characters"
                    onChange={handleChange}
                    className="py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-gray-700 font-medium">
                    OTP (Check your email)
                  </Label>
                  <Input
                    id="otp"
                    name="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    onChange={handleChange}
                    className="py-2 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 shadow-md hover:shadow-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={20} />
                      Creating account...
                    </>
                  ) : (
                    "Sign Up"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOtpSent(false)}
                  className="w-full py-2 text-gray-700 font-medium rounded-lg transition duration-200"
                >
                  Back
                </Button>
              </>
            )}
          </form>

          {!otpSent && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-gray-500 font-medium">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full py-2 bg-white text-gray-700 border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition duration-200 flex items-center justify-center"
                onClick={() => (window.location.href = `${apiUrl}`)}
              >
                <img
                  src="https://developers.google.com/identity/images/g-logo.png"
                  alt="Google"
                  className="h-5 w-5 mr-3"
                />
                Continue with Google
              </Button>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-center mt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 font-medium hover:text-blue-800 hover:underline transition duration-200"
            >
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;