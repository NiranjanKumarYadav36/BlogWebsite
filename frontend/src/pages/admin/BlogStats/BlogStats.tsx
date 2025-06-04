import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import AxiosClient from "../../../components/ApiClient/AxiosClient";
import AdminSideBar from "../../../components/AdminComponents/AdminSideBar";
import { Menu } from "lucide-react";
import { Card, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
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
import toast, { Toaster } from "react-hot-toast";
import ReactionCharts from "./RactionCharts";


interface Comment {
    id: number;
    username: string;
    created_at: string;
    content: string;
}

interface ReactionData {
    label: string;
    value: number;
}



function BlogStats() {

    const { state } = useLocation();
    const id = state?.id

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [totalComments, setTotalComments] = useState(0);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
    const [reactions, setReactions] = useState<ReactionData[]>([]);

    // Add better error handling for missing id
    useEffect(() => {
        if (!id) {
            toast.error("Invalid Blog Please navigate from the blogs list.");
            // Consider redirecting back to blogs list
            return;
        }
        fetchBlogStatistics(id);
        fetchReactions(id);
    }, [id]);

    const fetchBlogStatistics = async (blogId: string) => {
        try {
            const response = await AxiosClient.get(`/admin/manage_blogs/stats/${blogId}`);
            setComments(response.data.result || []);
            setTotalComments(response.data.result.length);
        } catch (error) {
            console.error("Error fetching blog statistics", error);
            toast.error("Error in fetching comment")
        }
    };

    const handleDelete = async () => {
        if (!selectedUserId) return;

        try {
            const response = await AxiosClient.delete(`/admin/manage_blogs/delete_comment/${selectedUserId}`)

            if (response.status == 200) {
                toast.success(response.data.message)
                fetchBlogStatistics(id)
            } else if (response.status == 404) {
                toast.error(response.data.message)
            }
            setSelectedUserId(null)

        } catch (error) {
            console.error("Error in deleting comment", error);
            toast.error("Error in deleting comment")
        }
    }

    const fetchReactions = async (blogId: string) => {
        try {
            const response = await AxiosClient.get(`/admin/manage_blogs/reactions/${blogId}`).catch(error => error.response);

            if (!response.data || !Array.isArray(response.data.reactions) || response.data.reactions.length === 0) {
                setReactions([]); // Set empty array to prevent errors
                return;
            }

            setReactions(response.data.reactions);
        } catch (err) {
            console.error("Error fetching reactions:", err);
            toast.error("Error fetching reactions");
        }
    };

    return (
        <div className="flex">
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
                className={`fixed inset-y-0 left-0 w-64 bg-white h-screen shadow-lg transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    } md:translate-x-0 md:relative z-50`}  // Add z-50 here
            >
                <AdminSideBar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            </div>

            {/* Overlay when sidebar is open (Mobile) */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black opacity-50 md:hidden z-40" // Ensure it's below the sidebar
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}


            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 p-6 overflow-auto bg-gray-100">
                {/* Left Grid - Total Comments and Comments List */}
                <div className="col-span-1 space-y-4">
                    {/* Total Comments Count */}
                    <Card className="w-[560px] h-[70px]">
                        <CardHeader >
                            <CardTitle className="text-lg">Total Comments: {totalComments}</CardTitle>
                        </CardHeader>
                    </Card>

                    <div className="w-[560px] h-[610px] overflow-y-auto space-y-4 border rounded-lg p-2 bg-white shadow">
                        {comments.map((comment, index) => (
                            <CommentItem
                                key={index}
                                comment={comment}
                                handleDelete={handleDelete}
                                setSelectedUserId={setSelectedUserId}
                            />
                        ))}
                    </div>
                </div>

                {/* Right Grid - Reactions Chart */}
                <div className="col-span-1">
                    <ReactionCharts data={reactions} />
                </div>
            </div>
        </div>
    );
}

interface CommentItemProps {
    comment: Comment;
    handleDelete: () => void;
    setSelectedUserId: (id: number) => void;
}


const CommentItem = ({ comment, handleDelete, setSelectedUserId }: CommentItemProps) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <Card className="shadow-md border p-2 w-full flex flex-col">
            <Toaster position="top-center" />
            <div className="p-2 break-words whitespace-normal">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold break-words">{comment.username}</h3>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" onClick={() => setSelectedUserId(comment.id)}>
                                Delete
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the comment.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete}>Yes, Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
                <p className="text-gray-500 text-xs">{new Date(comment.created_at).toLocaleString()}</p>

                {/* Comment Content with Read More */}
                <div className={`text-sm break-words whitespace-normal transition-all ${expanded ? "" : "line-clamp-3"}`}>
                    {comment.content}
                </div>

                {comment.content.length > 100 && (
                    <div className="text-end">
                        <button
                            className="text-blue-500 text-xs underline-none"
                            onClick={() => setExpanded(!expanded)}
                        >
                            {expanded ? "Read Less" : "Read More..."}
                        </button>
                    </div>
                )}
            </div>
        </Card>
    );
};
export default BlogStats;