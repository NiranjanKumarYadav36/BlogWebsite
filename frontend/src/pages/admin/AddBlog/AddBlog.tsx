import React, { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import AdminSideBar from "../../../components/AdminComponents/AdminSideBar";
import TipTapEditor from "../../../components/TipTap/TipTapEditor";
import AxiosClient from "../../../components/ApiClient/AxiosClient";
import { Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";

const AddBlog: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [editorContent, setEditorContent] = useState("");
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [subcategoryId, setSubcategoryId] = useState<number | null>(null);
    const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
    const [subcategories, setSubcategories] = useState<{ id: number; name: string; category_id: number }[]>([]);
    const navigate = useNavigate();

    const [isSaving, setIsSaving] = useState(false);
    const [coverImage, setCoverImage] = useState<File | null>(null);



    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await AxiosClient.get("/admin/manage_categories/categories");
                setCategories(response.data.data || []);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        if (categoryId) {
            // Fetch subcategories based on selected category
            const fetchSubcategories = async () => {
                try {
                    const response = await AxiosClient.get(`/admin/add_blog/subcategories?category_id=${categoryId}`);
                    setSubcategories(response.data.subcategories); // Expecting an array of { id, name, category_id }
                } catch (error) {
                    console.error("Error fetching subcategories:", error);
                }
            };
            fetchSubcategories();
        } else {
            setSubcategories([]); // Reset subcategories when no category is selected
        }
    }, [categoryId]);


    const handleSaveBlog = async () => {
        if (!title || !description || !editorContent || !categoryId || !subcategoryId || !coverImage) {
            toast.error("Please fill all fields before saving.");
            return;
        }

        setIsSaving(true); // Start spinner

        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            formData.append("content", editorContent);
            formData.append("category_id", categoryId.toString());
            formData.append("subcategory_id", subcategoryId.toString());
            formData.append("coverImage", coverImage); // 🖼️ image added


            const response = await AxiosClient.post(
                "/admin/add_blog",
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            if (response.status === 201) {
                toast.success("Blog saved successfully!");
                setTitle("");
                setDescription("");
                setEditorContent("");
                setCategoryId(null);
                setSubcategoryId(null);
                setCoverImage(null);
                navigate("/admin/manage_blogs");
            } else {
                toast.error("Failed to save blog.");
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("Something went wrong.");
        } finally {
            setIsSaving(false); // Stop spinner
        }
    };

    const draftBlog = async () => {
        // Validate all required fields
        if (!title || !description || !editorContent || !categoryId || !subcategoryId || !coverImage) {
            toast.error("Please fill all fields before saving as draft.");
            return;
        }

        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            formData.append("content", editorContent);
            formData.append("category_id", categoryId.toString());
            formData.append("subcategory_id", subcategoryId.toString());
            if (coverImage) {
                formData.append("coverImage", coverImage);
            }

            const response = await AxiosClient.post(
                "/admin/add_draft_blog",
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            if (response.status === 201) {
                toast.success("Draft saved successfully!");
                // Reset form
                setTitle("");
                setDescription("");
                setEditorContent("");
                setCategoryId(null);
                setSubcategoryId(null);
                setCoverImage(null);
                navigate("/admin/manage_blogs");
            } else {
                toast.error(response.data?.message || "Failed to save draft.");
            }
        } catch (error: any) {
            console.error("Error saving draft:", error);
            toast.error(error.response?.data?.message || "Something went wrong while saving draft.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex md:flex-row min-h-screen bg-gray-100">
            <Toaster position="top-center" />

            {/* Mobile Sidebar Toggle */}
            <button
                className="absolute top-4 left-4 md:hidden bg-white p-2 rounded-full shadow-md"
                onClick={() => setIsSidebarOpen(true)}
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 w-full md:w-64 bg-white shadow-lg transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    } transition-transform md:relative md:translate-x-0 md:block z-50 block h-fit min-h-screen`}
            >
                <AdminSideBar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            </div>

            {/* Main Content */}
            <div className="flex-grow p-4 md:p-6">
                <TipTapEditor
                    title={title}
                    setTitle={setTitle}
                    description={description}
                    setDescription={setDescription}
                    setEditorContent={setEditorContent}
                    categoryId={categoryId}
                    setCategoryId={setCategoryId}
                    subcategoryId={subcategoryId}
                    setSubcategoryId={setSubcategoryId}
                    categories={categories}
                    subcategories={subcategories}
                    coverImage={coverImage}
                    setCoverImage={setCoverImage}
                    content={editorContent}
                />

                {/* Buttons (Placed Properly) */}
                <div className="flex flex-col sm:flex-row gap-4 mt-6 ml-9">
                    <Button
                        className={`bg-blue-500 text-white px-4 py-2 rounded flex items-center justify-center gap-2 ${(isSaving) ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                        onClick={handleSaveBlog}
                        disabled={isSaving}
                    >
                        {isSaving && (
                            <svg
                                className="animate-spin h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v4l3.5-3.5L12 0v4a8 8 0 00-8 8h4z"
                                ></path>
                            </svg>
                        )}
                        {isSaving ? "Saving..." : "Save Blog"}
                    </Button>

                    <Button
                        className={`bg-gray-500 text-white px-4 py-2 rounded flex items-center justify-center gap-2 ${(isSaving) ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                        onClick={draftBlog}
                        disabled={isSaving}>
                        Draft Blog
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AddBlog;