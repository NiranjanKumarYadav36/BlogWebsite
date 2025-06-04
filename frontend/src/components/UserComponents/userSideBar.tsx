import React, { useEffect, useState } from "react";
import AxiosClient from "../ApiClient/AxiosClient";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "../../components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

interface SidebarProps {
    onClose?: () => void;
    onCategorySelect?: (selectedCategories: string[]) => void;
    selectedCategories?: string[];
}

interface Categories {
    id: number;
    name: string;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose, selectedCategories: initialSelectedCategories = [], onCategorySelect }) => {
    const [categories, setCategories] = useState<Categories[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>(initialSelectedCategories);
    const [dropdownExpanded, setDropdownExpanded] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await AxiosClient.get("/user/categories");
                if (response.status === 201) {
                    setCategories(response.data.categories);
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategories();
    }, []);

    const toggleCategorySelection = (categoryName: string) => {
        const updatedCategories = selectedCategories.includes(categoryName)
            ? selectedCategories.filter((cat) => cat !== categoryName)
            : [...selectedCategories, categoryName];
        
        setSelectedCategories(updatedCategories);
        onCategorySelect?.(updatedCategories);
    };

    
    const applySelection = async () => {
        try {
            const query = selectedCategories.map((name) => `q=${encodeURIComponent(name)}`).join("&");

            const response = await AxiosClient.get(`/user/categories/filter?${query}`);

            if (response.status == 201) {
                navigate("/filtered-blogs", {
                    state: {
                        blogs: response.data.blogs,
                        selectedCategories: selectedCategories 
                    }
                });
                if (onClose) onClose(); // Close the sidebar after applying
            }
        } catch (error) {
            console.error("Error fetching filtered blogs:", error);
            toast.error("Error fetching filtered blogs");
        }
    };

    return (
        <div className="h-full bg-gray-800 text-white p-6 shadow-lg overflow-y-auto w-[230px]">
            {/* Close button for mobile */}
            <div className="md:hidden flex justify-end mb-4">
                <button
                    onClick={onClose}
                    className="text-white p-2 rounded-md hover:bg-gray-700"
                >
                    ✕
                </button>
            </div>

            <div className="flex justify-between items-center mt-15 -ml-3">
                <h2 className="text-lg font-bold">Categories</h2>
            </div>

            <nav className="mt-6 space-y-4">
                {categories.length > 0 ? (
                    categories.slice(0, 4).map((category) => (
                        <button
                            key={category.id}
                            className={`block py-2 px-2 mb-2 rounded transition ${selectedCategories.includes(category.name) ? "bg-gray-700" : "hover:bg-gray-700"
                                }`}
                            onClick={() => toggleCategorySelection(category.name)}
                        >
                            {category.name}
                        </button>
                    ))
                ) : (
                    <p className="text-gray-400">No categories available</p>
                )}


                {categories.length > 4 && (
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            className={`block w-full text-left py-2 px-2 rounded ${categories.slice(4).length === 0 ? "text-gray-500 cursor-not-allowed" : "hover:bg-gray-700"
                                } transition`}
                            onClick={() => categories.slice(4).length > 0 && setDropdownExpanded(!dropdownExpanded)}
                            disabled={categories.slice(4).length === 0}
                        >
                            View More
                        </DropdownMenuTrigger>
                        {dropdownExpanded && categories.slice(4).length > 0 && (
                            <DropdownMenuContent className="bg-gray-800 text-white w-52 mt-2 rounded shadow-lg">
                                {categories.slice(4).map((category) => (
                                    <DropdownMenuItem
                                        key={category.id}
                                        className={`py-2 px-4 transition ${selectedCategories.includes(category.name) ? "bg-gray-700" : "hover:bg-gray-700"
                                            }`}
                                        onClick={() => toggleCategorySelection(category.name)}
                                    >
                                        {category.name}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        )}
                    </DropdownMenu>
                )}

            </nav>

            {/* Apply Button */}
            <button
                className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
                onClick={applySelection}
            >
                Apply
            </button>
        </div>
    );
};

export default Sidebar;