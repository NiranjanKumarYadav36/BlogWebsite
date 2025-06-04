import { useCallback, useEffect, useState } from 'react';
import AdminSideBar from '../../../components/AdminComponents/AdminSideBar';
import { Card, CardContent, CardDescription, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { FiDownload, FiEdit, FiEye, FiEyeOff, FiTrash2 } from 'react-icons/fi';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "../../../components/ui/alert-dialog";
import AxiosClient from '../../../components/ApiClient/AxiosClient';
import { Toaster, toast } from "react-hot-toast";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "../../../components/ui/pagination";
import { useNavigate } from 'react-router-dom';
import { Menu, ReceiptText, ArrowUp, Loader2, FileSearch, MoveRight, Calendar, RefreshCw, Heart, MessageSquare, Archive, FileEdit } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../components/ui/select"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../../../components/ui/dialog"
import { Label } from 'recharts';

interface Blogs {
    id: number,
    title: string,
    description: string,
    created_at: string,
    updated_at: string
    comment_count: string,
    reaction_count: string,
    comments_enabled: string
}
interface DraftBlogs {
    id: number,
    title: string,
    description: string,
    created_at: string,
    updated_at: string,
    subcategory_id: number
}

interface DeletedBlogs {
    id: number,
    title: string,
    description: string,
    created_at: string,
    updated_at: string
    comment_count: string,
    reaction_count: string,
    comments_enabled: string
}

interface Category {
    id: number,
    name: string
}

interface SubCategory extends Category {
    category_id: number
}

function ManageBlogs() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [blogs, setBlogs] = useState<Blogs[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const navigate = useNavigate();

    const [currentActivePage, setCurrentActivePage] = useState(1);
    const [totalActivePages, setTotalActivePages] = useState(1);

    const [currentDeletedPage, setCurrentDeletedPage] = useState(1);
    const [totalDeletedPages, setTotalDeletedPages] = useState(1);

    const [currentDraftPage, setCurrentDraftPage] = useState(1);
    const [totalDraftPages, setTotalDraftPages] = useState(1);

    const [activeBlogs, setActiveBlogs] = useState<Blogs[]>([]);
    const [deletedBlogs, setDeletedBlogs] = useState<DeletedBlogs[]>([]);
    const [activeTab, setActiveTab] = useState("active");

    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [filteredSubcategories, setFilteredSubcategories] = useState<SubCategory[]>([]);
    const [selectedSubcategory, setSelectedSubcategory] = useState<number | null>(null);
    const [dialogMessage, setDialogMessage] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [draftBlogs, setDraftBlogs] = useState<DraftBlogs[]>([]);

    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [downloadingBlogIds, setDownloadingBlogIds] = useState<number[]>([]);



    useEffect(() => {
        fetchCategoriesAndSubcategories();
    }, []);

    useEffect(() => {
        if (categories.length > 0) {
            setSelectedCategory(categories[0].id); // Set first category by default
        }
    }, [categories]);

    useEffect(() => {
        if (selectedCategory !== null) {
            const filtered = subcategories.filter(sub => sub.category_id === selectedCategory);
            setFilteredSubcategories(filtered);
            setSelectedSubcategory(null); // Reset if no subcategories exist

        }
    }, [selectedCategory, subcategories]);

    const fetchCategoriesAndSubcategories = async () => {
        try {
            const [categoriesResponse, subcategoriesResponse] = await Promise.all([
                AxiosClient.get("/admin/manage_categories/categories"),
                AxiosClient.get("/admin/manage_categories/subcategories")
            ]);


            setCategories(categoriesResponse.data.data || []);
            setSubcategories(subcategoriesResponse.data.data || []);

            // Set default category
            if (categoriesResponse.data.data.length > 0) {
                setSelectedCategory(categoriesResponse.data.data[0].id);
            }

        } catch (error) {
            toast.error("Failed to load categories and subcategories!");
            setCategories([]);
            setSubcategories([]);
        }
    };



    const fetchBlogs = useCallback(async (page = 1, query = searchQuery) => {
        try {
            setIsLoading(true);
            const response = await AxiosClient.get(
                `/admin/manage_blogs?page=${page}&limit=6${query ? `&search=${encodeURIComponent(query)}` : ''}`
            );
            if (response.status === 200) {
                setBlogs(response.data.blogs);
                setTotalActivePages(response.data.pagination.totalPages);
            }
        } catch (error) {
            toast.error("Error fetching blogs");
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery]);

    const fetchDeletedBlogs = useCallback(async (page = 1, query = searchQuery) => {
        try {
            setIsLoading(true);
            const response = await AxiosClient.get(
                `/admin/manage_blogs/deleted_blogs_list?page=${page}&limit=6${query ? `&search=${encodeURIComponent(query)}` : ''}`
            );
            if (response.status === 200 && Array.isArray(response.data.blogs)) {
                setDeletedBlogs(response.data.blogs);
                setTotalDeletedPages(response.data.pagination.totalPages);
            } else {
                setDeletedBlogs([]);
            }
        } catch (error) {
            toast.error("Failed to fetch deleted blogs.");
            setDeletedBlogs([]);
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery]);

    const handleDelete = async () => {
        try {
            await AxiosClient.delete(`/admin/delete_blogs/${selectedId}`);
            setBlogs(blogs.filter(blog => blog.id !== selectedId));
            toast.success("Blog deleted successfully");
        } catch (error) {
            toast.error("Error in deleting blog");
        }
        setSelectedId(null);
    };

    const handleEdit = async (id: number, navigate: Function) => {
        try {
            const response = await AxiosClient.get(`/admin/edit_blog/${id}`)
            navigate("/admin/edit_blog", { state: { blog: response.data.result[0] } })
        } catch (error) {
            toast.error("Error");
        };
        setSelectedId(null)
    };

    const blogStatistics = async (id: number, title: string, navigate: Function) => {
        try {
            // Replace spaces and special characters for a basic slug
            const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

            navigate(`/admin/blog_stats/${slug}`, { state: { id } });
        } catch (error) {
            toast.error("Error");
        }
        setSelectedId(null);
    };

    const resetSelections = () => {
        setSelectedCategory(null);
        setSelectedSubcategory(null);
        setFilteredSubcategories([]);
        setDialogMessage(null)
    };

    const handleSubmit = async () => {
        if (!selectedId) {
            setDialogMessage("❌ No blog selected!");
            return;
        }

        if (!selectedCategory) {
            setDialogMessage("❌ Please select a category first!");
            return;
        }

        if (!selectedSubcategory) {
            setDialogMessage("❌ Please select a subcategory!");
            return;
        }

        try {
            const response = await AxiosClient.post("/admin/manage_blogs/add_blog_to_active", {
                blog_id: selectedId,
                category_id: selectedCategory,
                subcategory_id: selectedSubcategory
            });

            if (response.status === 201) {
                setDialogMessage("✅ Blog added successfully!");

                // Remove the blog from deletedBlogs and add it to activeBlogs
                const updatedDeletedBlogs = deletedBlogs.filter(blog => blog.id !== selectedId);
                setDeletedBlogs(updatedDeletedBlogs);

                const restoredBlog = deletedBlogs.find(blog => blog.id === selectedId);
                if (restoredBlog) {
                    setActiveBlogs([...activeBlogs, restoredBlog]);
                }

                // Close the dialog and reset selections after 3 seconds
                setTimeout(() => {
                    resetSelections();
                    setDialogMessage(null);
                    setIsDialogOpen(false);
                }, 3000);
            }
        } catch (error) {
            setDialogMessage("❌ Failed to add blog!");

            // Keep the message for 3 seconds before clearing
            setTimeout(() => {
                setDialogMessage(null);
            }, 3000);
        }
    };

    const fetchDraftBlogs = useCallback(async (page = 1, query = searchQuery) => {
        try {
            setIsLoading(true);
            const response = await AxiosClient.get(`/admin/fetch_draft_blogs?page=${page}&limit=6${query ? `&search=${encodeURIComponent(query)}` : ''}`)
                .catch(error => error.response);
            if (response.status === 200) {
                setDraftBlogs(response.data.result || []);
                setTotalDraftPages(response.data.pagination.totalPages);
                if (response.data.result.length === 0) {
                    toast.success("No draft blogs available");
                }
            } else {
                setDraftBlogs([]);
                toast.success(response.data.message || "No draft blogs available");
            }
        } catch (error) {
            toast.error("Failed to fetch blogs");
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery]);

    const publishBlog = async (id: number) => {
        try {
            if (!id) {
                toast.error("Select a blog to publish");
                return;
            }


            const response = await AxiosClient.post("/admin/publish_draft_blogs", { blog_id: id });

            if (response.status === 201) {
                toast.success("Blog published successfully");
                // Small delay to allow backend update
                setTimeout(() => {
                    fetchDraftBlogs();
                }, 900);
                setSelectedId(null);
            } else {
                toast.error("Failed to publish blog");
            }
        } catch (error) {
            toast.error("Failed to publish blog");
        }
    };

    const toggleComments = async (id: number, comments_enabled: string) => {
        try {
            if (!id || !comments_enabled) {
                toast.error("select any one blog")
                return;
            }

            const response = await AxiosClient.put("/admin/toggle_commnets", {
                id, comments_enabled
            })

            if (response.status == 201) {
                toast.success(response.data.message)
                if (activeTab === 'active') {
                    fetchBlogs(currentActivePage);
                }
            }
        } catch (error: any) {
            if (error.response && error.response.status == 500) {
                toast.error(error.response.data.message)
            } else {
                toast.error("something went wrong!")
            }
        }
    };


    const handleDownloadBlog = async (id: number) => {
        try {
            setDownloadingBlogIds(prev => [...prev, id]);
            // 1. Fetch the PDF (using either Axios or native fetch)
            const response = await AxiosClient.get(`/user/downloadBlog/${id}`, {
                responseType: 'blob',
            });

            // 2. Create the Blob and URL
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const blobUrl = URL.createObjectURL(blob);



            // 3. Create and trigger download
            const downloadLink = document.createElement('a');
            downloadLink.href = blobUrl;

            // Extract filename from headers or use default
            const contentDisposition = response.headers['content-disposition'];
            let filename = `blog_${id}.pdf`;

            if (contentDisposition && contentDisposition.includes('filename=')) {
                const match = contentDisposition.match(/filename="?([^"]+)"?/);
                if (match?.[1]) {
                    filename = match[1];
                }
            }

            downloadLink.download = filename;

            // 4. Required for Firefox
            document.body.appendChild(downloadLink);
            downloadLink.click();

            // 5. Cleanup (with delay for Edge/IE)
            setTimeout(() => {
                document.body.removeChild(downloadLink);
                URL.revokeObjectURL(blobUrl);
            }, 100);

        } catch (error) {
            toast.error("Download failed");
            console.error("Download error:", error);
        } finally {
            setDownloadingBlogIds(prev => prev.filter(blogId => blogId !== id));
        }
    };

    useEffect(() => {
        if (activeTab === 'active') {
            fetchBlogs(currentActivePage);
        } else if (activeTab === 'deleted') {
            fetchDeletedBlogs(currentDeletedPage);
        } else if (activeTab === "draft") {
            fetchDraftBlogs(currentDraftPage);
        }
    }, [activeTab, currentActivePage, currentDeletedPage, currentDraftPage, fetchBlogs, fetchDeletedBlogs, fetchDraftBlogs]);

    return (
        <div className='flex min-h-screen bg-gray-50'>
            <Toaster position='top-center' toastOptions={{ duration: 3000 }} />

            {/* Sidebar Toggle Button for Small Screens */}
            <button
                className="fixed top-4 left-4 md:hidden bg-white p-2 rounded-lg shadow-md z-40 hover:bg-gray-100 transition-colors"
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Open sidebar"
            >
                <Menu className="w-6 h-6 text-gray-700" />
            </button>

            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 w-64 bg-white shadow-xl transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } transition-transform duration-300 ease-in-out md:translate-x-0 md:relative z-50`}
            >
                <AdminSideBar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            </div>

            {/* Overlay when sidebar is open (Mobile) */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm md:hidden z-40"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className='flex-1 p-4 md:p-6 ml-0 md:ml-10 transition-all duration-300'>
                <div className="max-w-7xl mx-auto">
                    {/* Tabs Navigation */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                        <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 h-auto rounded-lg">
                            <TabsTrigger
                                value="active"
                                className="py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                            >
                                Active Blogs
                            </TabsTrigger>
                            <TabsTrigger
                                value="deleted"
                                className="py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                            >
                                Archived Blogs
                            </TabsTrigger>
                            <TabsTrigger
                                value="draft"
                                className="py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                            >
                                Drafts
                            </TabsTrigger>
                        </TabsList>

                        {/* Search Bar */}
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 hidden sm:block">
                                {activeTab === 'active' && 'Active Blogs'}
                                {activeTab === 'deleted' && 'Archived Blogs'}
                                {activeTab === 'draft' && 'Draft Blogs'}
                            </h2>
                            <div className="relative w-full sm:w-64">
                                <input
                                    type="text"
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="Search blogs..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && fetchBlogs(1, searchQuery)}
                                />
                                {isLoading ? (
                                    <Loader2 className="absolute right-3 top-2.5 animate-spin text-gray-400" size={18} />
                                ) : (
                                    <FileSearch
                                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
                                        size={18}
                                        onClick={() => fetchBlogs(1, searchQuery)}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Active Blogs Tab */}
                        <TabsContent value='active'>
                            {blogs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <FileSearch className="w-12 h-12 text-gray-400 mb-4" />
                                    <p className="text-gray-500 text-lg">No active blogs found</p>
                                </div>
                            ) : (
                                <>
                                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                                        {blogs.map((blog) => (
                                            <Card key={blog.id} className="hover:shadow-lg transition-all duration-300 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col h-full">
                                                <CardContent className="flex flex-col flex-grow p-6">
                                                    <div className="flex-grow">
                                                        <CardTitle className="text-xl font-bold text-gray-800 mb-2">{blog.title}</CardTitle>
                                                        <CardDescription className="text-gray-600 line-clamp-3 mb-4">
                                                            {blog.description}
                                                        </CardDescription>
                                                    </div>
                                                    <div className="text-sm text-gray-500 space-y-1">
                                                        <div className="flex items-center">
                                                            <MessageSquare className="w-4 h-4 mr-2" />
                                                            <span>{blog.comment_count} comments</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Heart className="w-4 h-4 mr-2" />
                                                            <span>{blog.reaction_count} reactions</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Calendar className="w-4 h-4 mr-2" />
                                                            <span>Added: {new Date(blog.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <RefreshCw className="w-4 h-4 mr-2" />
                                                            <span>Updated: {new Date(blog.updated_at).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>

                                                    <div className="mt-6 space-y-2">
                                                        {/* Edit + Comments Toggle */}
                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant="outline"
                                                                className="flex-1 gap-2 border-gray-300 hover:bg-gray-50"
                                                                onClick={() => {
                                                                    setSelectedId(blog.id);
                                                                    handleEdit(blog.id, navigate);
                                                                }}
                                                            >
                                                                <FiEdit size={16} />
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                variant={blog.comments_enabled === 'yes' ? "outline" : "default"}
                                                                className={`flex-1 gap-2 ${blog.comments_enabled === 'yes'
                                                                    ? 'border-yellow-400 text-yellow-600 hover:bg-yellow-50'
                                                                    : 'bg-green-600 hover:bg-green-700'
                                                                    }`}
                                                                onClick={() => toggleComments(blog.id, blog.comments_enabled)}
                                                            >
                                                                {blog.comments_enabled === "yes" ? (
                                                                    <><FiEyeOff size={16} /> Disable</>
                                                                ) : (
                                                                    <><FiEye size={16} /> Enable</>
                                                                )}
                                                            </Button>
                                                            {/* Download Button */}
                                                            <Button
                                                                variant="outline"
                                                                className="flex-1 gap-2 border-blue-300 text-blue-600 hover:bg-blue-50"
                                                                onClick={() => handleDownloadBlog(blog.id)}
                                                                disabled={downloadingBlogIds.includes(blog.id)}
                                                            >
                                                                <FiDownload size={16} />
                                                                {downloadingBlogIds.includes(blog.id) ? "Downloading..." : "PDF"}
                                                            </Button>
                                                        </div>

                                                        {/* Details + Delete */}
                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant="default"
                                                                className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
                                                                onClick={() => {
                                                                    setSelectedId(blog.id);
                                                                    blogStatistics(blog.id, blog.title, navigate);
                                                                }}
                                                            >
                                                                <ReceiptText size={16} />
                                                                Details
                                                            </Button>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button
                                                                        variant="destructive"
                                                                        className="flex-1 gap-2"
                                                                        onClick={() => setSelectedId(blog.id)}
                                                                    >
                                                                        <FiTrash2 size={16} />
                                                                        Delete
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            This will move the blog to archives. You can restore it later if needed.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            className="bg-red-600 hover:bg-red-700"
                                                                            onClick={handleDelete}
                                                                        >
                                                                            Confirm
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {totalActivePages > 1 && (
                                        <div className='flex justify-center mt-8'>
                                            <Pagination>
                                                <PaginationContent>
                                                    <PaginationPrevious
                                                        onClick={() => setCurrentActivePage(prev => Math.max(prev - 1, 1))}
                                                        className={currentActivePage === 1 ? 'pointer-events-none opacity-50' : ''}
                                                    />
                                                    {[...Array(totalActivePages)].map((_, index) => (
                                                        <PaginationItem key={index}>
                                                            <PaginationLink
                                                                size="sm"
                                                                isActive={currentActivePage === index + 1}
                                                                onClick={() => setCurrentActivePage(index + 1)}
                                                                className="hover:bg-gray-100"
                                                            >
                                                                {index + 1}
                                                            </PaginationLink>
                                                        </PaginationItem>
                                                    ))}
                                                    <PaginationNext
                                                        onClick={() => setCurrentActivePage(prev => Math.min(prev + 1, totalActivePages))}
                                                        className={currentActivePage === totalActivePages ? 'pointer-events-none opacity-50' : ''}
                                                    />
                                                </PaginationContent>
                                            </Pagination>
                                        </div>
                                    )}
                                </>
                            )}
                        </TabsContent>

                        {/* Archived Blogs Tab */}
                        <TabsContent value='deleted'>
                            {deletedBlogs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Archive className="w-12 h-12 text-gray-400 mb-4" />
                                    <p className="text-gray-500 text-lg">No archived blogs found</p>
                                </div>
                            ) : (
                                <>
                                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                                        {deletedBlogs.map((blog) => (
                                            <Card key={blog.id} className="hover:shadow-lg transition-all duration-300 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col h-full">
                                                <CardContent className="flex flex-col flex-grow p-6">
                                                    <div className="flex-grow">
                                                        <CardTitle className="text-xl font-bold text-gray-800 mb-2">{blog.title}</CardTitle>
                                                        <CardDescription className="text-gray-600 line-clamp-3 mb-4">
                                                            {blog.description}
                                                        </CardDescription>
                                                    </div>
                                                    <div className="text-sm text-gray-500 space-y-1">
                                                        <div className="flex items-center">
                                                            <MessageSquare className="w-4 h-4 mr-2" />
                                                            <span>{blog.comment_count} comments</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Heart className="w-4 h-4 mr-2" />
                                                            <span>{blog.reaction_count} reactions</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Calendar className="w-4 h-4 mr-2" />
                                                            <span>Added: {new Date(blog.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <RefreshCw className="w-4 h-4 mr-2" />
                                                            <span>Updated: {new Date(blog.updated_at).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>

                                                    <div className="mt-6 space-y-2">
                                                        <Button
                                                            variant="default"
                                                            className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
                                                            onClick={() => {
                                                                setSelectedId(blog.id);
                                                                blogStatistics(blog.id, blog.title, navigate);
                                                            }}
                                                        >
                                                            <ReceiptText size={16} />
                                                            View Details
                                                        </Button>

                                                        <Dialog
                                                            open={isDialogOpen}
                                                            onOpenChange={(open) => {
                                                                setIsDialogOpen(open);
                                                                if (!open) resetSelections();
                                                            }}
                                                        >
                                                            <DialogTrigger asChild>
                                                                <Button
                                                                    variant="default"
                                                                    className="w-full gap-2 bg-purple-600 hover:bg-purple-700"
                                                                    onClick={() => {
                                                                        setSelectedId(blog.id);
                                                                        setIsDialogOpen(true);
                                                                    }}
                                                                >
                                                                    <MoveRight size={16} />
                                                                    Move to Category
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent className="sm:max-w-md">
                                                                <DialogHeader>
                                                                    <DialogTitle>Assign Categories</DialogTitle>
                                                                    <DialogDescription className="mt-4 space-y-4">
                                                                        <div className="space-y-2">
                                                                            <Label>Category</Label>
                                                                            <Select
                                                                                onValueChange={(value) => setSelectedCategory(Number(value))}
                                                                                value={selectedCategory?.toString()}
                                                                            >
                                                                                <SelectTrigger>
                                                                                    <SelectValue placeholder="Select a category" />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    {categories.map(category => (
                                                                                        <SelectItem
                                                                                            key={category.id}
                                                                                            value={category.id.toString()}
                                                                                        >
                                                                                            {category.name}
                                                                                        </SelectItem>
                                                                                    ))}
                                                                                </SelectContent>
                                                                            </Select>
                                                                        </div>

                                                                        <div className="space-y-2">
                                                                            <Label>Subcategory</Label>
                                                                            <Select
                                                                                onValueChange={(value) => setSelectedSubcategory(Number(value))}
                                                                                disabled={!selectedCategory}
                                                                                value={selectedSubcategory?.toString()}
                                                                            >
                                                                                <SelectTrigger disabled={!selectedCategory}>
                                                                                    <SelectValue placeholder="Select a subcategory" />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    {filteredSubcategories.length > 0 ? (
                                                                                        filteredSubcategories.map(subcategory => (
                                                                                            <SelectItem
                                                                                                key={subcategory.id}
                                                                                                value={subcategory.id.toString()}
                                                                                            >
                                                                                                {subcategory.name}
                                                                                            </SelectItem>
                                                                                        ))
                                                                                    ) : (
                                                                                        <SelectItem value="no_subcategory" disabled>
                                                                                            No subcategories available
                                                                                        </SelectItem>
                                                                                    )}
                                                                                </SelectContent>
                                                                            </Select>
                                                                        </div>

                                                                        {dialogMessage && (
                                                                            <p className={`mt-2 text-sm ${dialogMessage.includes("✅")
                                                                                ? "text-green-600"
                                                                                : "text-red-600"
                                                                                }`}>
                                                                                {dialogMessage}
                                                                            </p>
                                                                        )}

                                                                        <Button
                                                                            variant="default"
                                                                            className="w-full mt-4"
                                                                            onClick={handleSubmit}
                                                                            disabled={!selectedCategory}
                                                                        >
                                                                            Assign Categories
                                                                        </Button>
                                                                    </DialogDescription>
                                                                </DialogHeader>
                                                            </DialogContent>
                                                        </Dialog>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {totalDeletedPages > 1 && (
                                        <div className='flex justify-center mt-8'>
                                            <Pagination>
                                                <PaginationContent>
                                                    <PaginationPrevious
                                                        onClick={() => setCurrentDeletedPage(prev => Math.max(prev - 1, 1))}
                                                        className={currentDeletedPage === 1 ? 'pointer-events-none opacity-50' : ''}
                                                        
                                                    />
                                                    {[...Array(totalDeletedPages)].map((_, index) => (
                                                        <PaginationItem key={index}>
                                                            <PaginationLink
                                                                size="sm"
                                                                isActive={currentDeletedPage === index + 1}
                                                                onClick={() => setCurrentDeletedPage(index + 1)}
                                                                className="hover:bg-gray-100"
                                                            >
                                                                {index + 1}
                                                            </PaginationLink>
                                                        </PaginationItem>
                                                    ))}
                                                    <PaginationNext
                                                        onClick={() => setCurrentDeletedPage(prev => Math.min(prev + 1, totalDeletedPages))}
                                                        className={currentDeletedPage === totalDeletedPages ? 'pointer-events-none opacity-50' : ''}
                                                        
                                                    />
                                                </PaginationContent>
                                            </Pagination>
                                        </div>
                                    )}
                                </>
                            )}
                        </TabsContent>

                        {/* Draft Blogs Tab */}
                        <TabsContent value="draft">
                            {draftBlogs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <FileEdit className="w-12 h-12 text-gray-400 mb-4" />
                                    <p className="text-gray-500 text-lg">No draft blogs found</p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {draftBlogs.map((blog) => (
                                            <Card
                                                key={blog.id}
                                                className="hover:shadow-lg transition-all duration-300 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col h-full"
                                            >
                                                <CardContent className="flex flex-col flex-grow p-6">
                                                    <div className="flex-grow">
                                                        <CardTitle className="text-xl font-bold text-gray-800 mb-2">
                                                            {blog.title}
                                                        </CardTitle>
                                                        <CardDescription className="text-gray-600 line-clamp-3 mb-4">
                                                            {blog.description}
                                                        </CardDescription>
                                                    </div>
                                                    <div className="text-sm text-gray-500 space-y-1">
                                                        <div className="flex items-center">
                                                            <Calendar className="w-4 h-4 mr-2" />
                                                            <span>Created: {new Date(blog.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <RefreshCw className="w-4 h-4 mr-2" />
                                                            <span>Updated: {new Date(blog.updated_at).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>

                                                    <Button
                                                        variant="default"
                                                        className="w-full mt-6 gap-2 bg-green-600 hover:bg-green-700"
                                                        onClick={() => {
                                                            setSelectedId(blog.id);
                                                            publishBlog(blog.id);
                                                        }}
                                                    >
                                                        <ArrowUp size={16} />
                                                        Publish Now
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>

                                    {totalDraftPages > 1 && (
                                        <div className='flex justify-center mt-8'>
                                            <Pagination>
                                                <PaginationContent>
                                                    <PaginationPrevious
                                                        onClick={() => setCurrentDraftPage(prev => Math.max(prev - 1, 1))}
                                                        className={currentDraftPage === 1 ? 'pointer-events-none opacity-50' : ''}
                                                    />
                                                    {[...Array(totalDraftPages)].map((_, index) => (
                                                        <PaginationItem key={index}>
                                                            <PaginationLink
                                                                size="sm"
                                                                isActive={currentDraftPage === index + 1}
                                                                onClick={() => setCurrentDraftPage(index + 1)}
                                                                className="hover:bg-gray-100"
                                                            >
                                                                {index + 1}
                                                            </PaginationLink>
                                                        </PaginationItem>
                                                    ))}
                                                    <PaginationNext
                                                        onClick={() => setCurrentDraftPage(prev => Math.min(prev + 1, totalDraftPages))}
                                                        className={currentDraftPage === totalDraftPages ? 'pointer-events-none opacity-50' : ''}
                                                    />
                                                </PaginationContent>
                                            </Pagination>
                                        </div>
                                    )}
                                </>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

export default ManageBlogs;