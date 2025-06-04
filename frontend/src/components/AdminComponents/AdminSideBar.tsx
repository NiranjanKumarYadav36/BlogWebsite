import { X, Plus, Users, FileText, LogOut, PencilLine, LayoutDashboard, Mailbox } from "lucide-react";
import { Button } from "../ui/button";
import { NavLink, useNavigate } from "react-router-dom";
import AxiosClient from "../ApiClient/AxiosClient";
import { toast } from "react-hot-toast";

type AdminSidebarProps = {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
};


const AdminSidebar: React.FC<AdminSidebarProps> = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await AxiosClient.post("/logout");
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-gray-800 to-gray-900 shadow-xl
        transition-all duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 h-screen flex flex-col text-white`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white">Admin Dashboard</h2>
        <Button 
          variant="ghost" 
          className="md:hidden hover:bg-gray-700 rounded-full p-2"
          onClick={() => setIsSidebarOpen(false)}
        >
          <X size={20} className="text-white" />
        </Button>
      </div>

      {/* Sidebar Content */}
      <div className="flex flex-col flex-1 justify-between overflow-y-auto">
        {/* Navigation Links */}
        <nav className="p-4 space-y-1">
          <NavLink 
            to="/admin/dashbboard" 
            className={({ isActive }) => 
              `block rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'}`
            }
          >
            <Button variant="ghost" className="w-full flex items-center justify-start gap-3 p-3">
              <LayoutDashboard size={18} /> Dashboard
            </Button>
          </NavLink>
          
          <NavLink 
            to="/admin/add_blog"
            className={({ isActive }) => 
              `block rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'}`
            }
          >
            <Button variant="ghost" className="w-full flex items-center justify-start gap-3 p-3">
              <Plus size={18} /> Add Blog
            </Button>
          </NavLink>
          
          <NavLink 
            to="/admin/manage_blogs"
            className={({ isActive }) => 
              `block rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'}`
            }
          >
            <Button variant="ghost" className="w-full flex items-center justify-start gap-3 p-3">
              <FileText size={18} /> Manage Blogs
            </Button>
          </NavLink>
          
          <NavLink 
            to="/admin/manage_categories"
            className={({ isActive }) => 
              `block rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'}`
            }
          >
            <Button variant="ghost" className="w-full flex items-center justify-start gap-3 p-3">
              <PencilLine size={18} /> Manage Categories
            </Button>
          </NavLink>
          
          <NavLink 
            to="/admin/blog_requests"
            className={({ isActive }) => 
              `block rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'}`
            }
          >
            <Button variant="ghost" className="w-full flex items-center justify-start gap-3 p-3">
              <Mailbox size={18} /> Blog Requests
            </Button>
          </NavLink>
          
          <NavLink 
            to="/admin/users_list"
            className={({ isActive }) => 
              `block rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'}`
            }
          >
            <Button variant="ghost" className="w-full flex items-center justify-start gap-3 p-3">
              <Users size={18} /> User Management
            </Button>
          </NavLink>
        </nav>

        {/* Logout Button at Bottom */}
        <div className="p-4 border-t border-gray-700">
          <Button
            variant="ghost"
            className="w-full flex items-center justify-start gap-3 p-3 hover:bg-red-600/90 text-white"
            onClick={handleLogout}
          >
            <LogOut size={18} /> Logout
          </Button>
        </div>
      </div>
    </aside>
  );
}

export default AdminSidebar;