import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Toaster, toast } from "react-hot-toast";
import AxiosClient from "../ApiClient/AxiosClient";

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await AxiosClient("/protected");

        if (response.status === 200 && response.data.username) {
          setUsername(response.data.username);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUsername(null); // Ensure no user is set
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await AxiosClient.post("/logout");
      toast.success("Logged out successfully");
      setUsername(null); // Clear username on logout
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
      <Toaster position="top-center" />
      <div className="container mx-auto flex justify-between items-center p-4">
        {/* Logo */}

        {username ? (
          <Link to="/blogs" className="text-2xl font-bold text-[#1E40AF]">
            MyBlog
          </Link>
        ) : (
          <Link to="/" className="text-2xl font-bold text-[#1E40AF]">
            MyBlog
          </Link>
        )}

        {/* Desktop Navigation (Only show if logged in) */}
        {username && (
          <nav className="hidden md:flex space-x-6">
            <NavLink
              to="/blogs"
              className={({ isActive }) =>
                `text-gray-700 hover:text-[#1E40AF] ${isActive ? 'text-yellow-400 font-semibold' : ''}`
              }
            >
              Blogs
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `text-gray-700 hover:text-[#1E40AF] ${isActive ? 'text-yellow-400 font-semibold' : ''}`
              }
            >
              About
            </NavLink>
          </nav>
        )}

        {/* User Avatar or Login Button (Desktop) */}
        <div className="hidden md:block">
          {username ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <Avatar>
                  <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>

              {/* Dropdown Options */}
              <DropdownMenuContent className="w-39">
                <DropdownMenuItem>{username}</DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/make-request">
                    Make Request
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-500 cursor-pointer" onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login" className="px-4 py-2 bg-[#1E40AF] text-white rounded-md hover:bg-[#1A365D]">
              Login
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-[#1E40AF]" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-lg absolute w-full p-4">
          <nav className="flex flex-col space-y-4">
            <Link to="/" className="text-gray-700 hover:text-[#1E40AF]">Home</Link>

            {/* Show Blogs and Contact only if logged in */}
            {username && (
              <>
                <Link to="/blogs" className="text-gray-700 hover:text-[#1E40AF]">Blogs</Link>
                <Link to="/contact" className="text-gray-700 hover:text-[#1E40AF]">Contact</Link>
              </>
            )}

            {/* User Avatar or Login Button (Mobile) */}
            <div className="flex justify-center">
              {username ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="focus:outline-none">
                    <Avatar>
                      <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-39">
                    <DropdownMenuItem>{username}</DropdownMenuItem>
                    <DropdownMenuItem>Make Request</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-500 cursor-pointer" onClick={handleLogout}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/login" className="px-4 py-2 bg-[#1E40AF] text-white rounded-md hover:bg-[#1A365D]">
                  Login
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;