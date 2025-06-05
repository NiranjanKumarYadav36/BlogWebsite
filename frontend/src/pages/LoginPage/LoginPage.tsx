import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Toaster, toast } from "react-hot-toast";
import { Loader2 } from "lucide-react"; // Added ArrowLeft icon
import AxiosClient from "../../components/ApiClient/AxiosClient";

interface LoginFormData {
  username: string;
  password: string;
}

const Login = () => {
  const [formData, setFormData] = useState<LoginFormData>({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.username || !formData.password) {
      toast.error("Please enter both username and password");
      setLoading(false);
      return;
    }

    try {
      const response = await AxiosClient.post("/login", formData);
      const role = response.data.user;

      if (response.data.success && role == "user") {
        toast.success("Login successful!");
        navigate("/blogs");
      } else if (response.data.success && role == "admin") {
        toast.success("Welcome Admin");
        navigate("/admin/dashbboard");
      } else {
        toast.error(response.data.message);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Login failed");
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
      <Card className="w-full max-w-md p-8 rounded-xl shadow-lg bg-white border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-center text-3xl font-bold text-blue-600">Welcome Back</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="Enter your password"
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
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>

        </CardContent>
        <CardFooter className="flex flex-col space-y-3 text-sm text-center mt-4">
          <Link
            to="/reset_password"
            className="text-blue-600 hover:text-blue-800 hover:underline transition duration-200"
          >
            Forgot Password?
          </Link>
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-blue-600 font-medium hover:text-blue-800 hover:underline transition duration-200"
            >
              Register here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;