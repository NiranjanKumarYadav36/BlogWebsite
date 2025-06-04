import React, { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import AdminSideBar from "../../../components/AdminComponents/AdminSideBar";
import TipTapEditor from "../../../components/TipTap/TipTapEditor";
import AxiosClient from "../../../components/ApiClient/AxiosClient";
import { Menu } from "lucide-react";

const EditBlog: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const passedBlogData = location.state?.blog; // Read passed data

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [title, setTitle] = useState(passedBlogData?.title || "");
    const [description, setDescription] = useState(passedBlogData?.description || "");
    const [editorContent, setEditorContent] = useState(passedBlogData?.content || ""); // Set content as HTML

    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [subcategoryId, setSubcategoryId] = useState<number | null>(null);
    const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
    const [subcategories, setSubcategories] = useState<{ id: number; name: string; category_id: number }[]>([]);

    const [coverImage, setCoverImage] = useState<File | null>(null);
    

    // Fetch from API only if no data was passed
    useEffect(() => {
        if (!passedBlogData && id) {
            AxiosClient.get(`/admin/edit_blog/${id}`)
                .then((response) => {
                    const blog = response.data.result[0];
                    setTitle(blog.title);
                    setDescription(blog.description);
                    setEditorContent(blog.content);
    
                    // Set category and subcategory from API response
                    setCategoryId(response.data.category.id);
                    setSubcategoryId(response.data.subcategory.id);
                })
                .catch(() => {
                    toast.error("Error fetching blog details");
                });
        }
    }, [id, passedBlogData]);
    

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

    const handleEditBlog = async () => {
        if (!title || !description || !editorContent || !categoryId || !subcategoryId || !coverImage) {
            toast.error("Please fill all fields before saving.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            formData.append("content", editorContent);
            formData.append("category_id", categoryId.toString());
            formData.append("subcategory_id", subcategoryId.toString());
            formData.append("coverImage", coverImage); // 🖼️ image added
            await AxiosClient.put(`/admin/edit_blog/${passedBlogData?.id}`, 
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            toast.success("Blog updated successfully!");
            navigate("/admin/manage_blogs"); // Redirect to blog list
        } catch (error) {
            console.error("Error:", error);
            toast.error("Something went wrong." + error);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Toaster position="top-center" />

            {/* Sidebar */}
            <button
                className="absolute top-4 left-4 md:hidden bg-white p-2 rounded-full shadow-md"
                onClick={() => setIsSidebarOpen(true)}
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Sidebar (Fixed Position) */}
            <div
                className={`fixed inset-y-0 left-0 w-64 bg-white h-screen shadow-lg transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } md:translate-x-0 md:relative`}
            >
                <AdminSideBar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            </div>


            {/* Overlay when sidebar is open (Mobile) */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black opacity-50 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Editor */}
            <div className="flex-grow p-6">
                <TipTapEditor
                    title={title}
                    setTitle={setTitle}
                    description={description}
                    setDescription={setDescription}
                    content={editorContent} // Pass content as prop
                    setEditorContent={setEditorContent}
                    categoryId={categoryId}
                    setCategoryId={setCategoryId}
                    subcategoryId={subcategoryId}
                    setSubcategoryId={setSubcategoryId}
                    categories={categories}
                    subcategories={subcategories}
                    coverImage={coverImage}
                    setCoverImage={setCoverImage}
                />

                {/* Save Button */}
                <button
                    className="bg-blue-500 text-white px-4 py-2 mt-4 rounded ml-250"
                    onClick={handleEditBlog}
                >
                    Update Blog
                </button>
            </div>
        </div>
    );
};

export default EditBlog;
