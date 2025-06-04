import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import AxiosClient from "../../../components/ApiClient/AxiosClient";
import { Card, CardContent, CardTitle, CardDescription } from "../../../components/ui/card";
import Header from "../../../components/Header/Header";
import Footer from "../../../components/Footer/Footer";
import PageNotFound from "../../../components/PageNotFound/PageNotFound";
import toast from "react-hot-toast";
import { Download } from "lucide-react";

// Emoji mapping for reaction types
const reactionEmojis: { [key: string]: string } = {
  like: "👍",
  love: "❤️",
  haha: "😂",
  wow: "😲",
  sad: "😢",
  angry: "😡",
};

// Default reaction counts
const defaultReactions = Object.keys(reactionEmojis).reduce(
  (acc, key) => ({ ...acc, [key]: 0 }),
  {} as Record<string, number>
);

interface Blog {
  id: number;
  title: string;
  content: string;
  description: string;
  comments_enabled: string;
}

interface Comment {
  id: number;
  blog_id: number;
  user_id: number;
  content: string;
  created_at: string;
  username: string;
}

function ShowBlog() {
  const location = useLocation();
  const blogId = location.state?.blogId;
  const [blog, setBlog] = useState<Blog | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [reactions, setReactions] = useState<Record<string, number>>(defaultReactions);
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [newComment, setNewComment] = useState<string>("");
  const [error, setError] = useState(false);
  const [isCommentAllowed, setIsCommentAllowed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);


  useEffect(() => {

    if (!blog?.id) return;
    const setView = async () => {
      try {
        const result = await AxiosClient.post("/admin/views",
          {
            "blog_id": blog?.id
          }
        )

        if (result.status == 400) {
          toast.success(result.data.message)
        }
      } catch (error) {
        toast.error("Internal server error");
      }
    }
    setView()
  }, [blog?.id])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [blogRes, commentsRes, reactionsRes, userReactionRes] = await Promise.all([
          AxiosClient.get(`/user/blogs/${blogId}`),
          AxiosClient.get(`/user/blogs/${blogId}/comments`),
          AxiosClient.get(`/user/blogs/${blogId}/reaction-summary`),
          AxiosClient.get(`/user/blogs/${blogId}/user-reaction`), // Fetch user's selected reaction
        ]);

        setBlog(blogRes.data.result);
        setComments(commentsRes.data.comments || []);

        // Ensure `isCommentAllowed` is always fetched correctly
        setIsCommentAllowed(commentsRes.status === 201);

        // Set reaction summary
        const fetchedReactions = reactionsRes.data.summary.reduce(
          (acc: Record<string, number>, { reaction_type, count }: { reaction_type: string; count: number }) => {
            acc[reaction_type] = count;
            return acc;
          },
          { ...defaultReactions }
        );
        setReactions(fetchedReactions);

        // **Set user's selected reaction**
        setUserReaction(userReactionRes.data.reaction);

      } catch (error) {
        console.error("Error fetching data:", error);
        setError(true);
      }
    };

    fetchData();
  }, [blogId]);

  const handleReactionClick = async (reaction: string) => {
    try {
      const response = await AxiosClient.post(`/user/blogs/${blogId}/reactions/add-reaction`, { reaction_type: reaction });

      if (response.status === 200) {
        // If the same reaction is clicked again, remove it (decrease count)
        if (userReaction === reaction) {
          setReactions((prev) => ({
            ...prev,
            [reaction]: Math.max(prev[reaction] - 1, 0),
          }));
          setUserReaction(null);
        } else {
          // If switching reaction, remove previous one and update new one
          if (userReaction) {
            setReactions((prev) => ({
              ...prev,
              [userReaction]: Math.max(prev[userReaction] - 1, 0),
            }));
          }
          setReactions((prev) => ({
            ...prev,
            [reaction]: prev[reaction] + 1,
          }));
          setUserReaction(reaction);
        }
      } else if (response.status === 201) {
        // If new reaction is added
        setReactions((prev) => ({
          ...prev,
          [reaction]: prev[reaction] + 1,
        }));
        setUserReaction(reaction);
      }

      // **Ensure UI syncs with backend after updating**
      setTimeout(() => {
        fetchUpdatedReactions();
        fetchUserReaction();
      }, 500); // Adding slight delay to avoid UI flickering

      toast.success(response.data.message);
    } catch (error) {
      console.error("Error updating reaction:", error);
      toast.error("Failed to update reaction.");
    }
  };

  // **Fetch latest reaction counts**
  const fetchUpdatedReactions = async () => {
    try {
      const reactionsRes = await AxiosClient.get(`/user/blogs/${blogId}/reaction-summary`);
      const updatedReactions = reactionsRes.data.summary.reduce(
        (acc: Record<string, number>, { reaction_type, count }: { reaction_type: string; count: number }) => {
          acc[reaction_type] = count;
          return acc;
        },
        { ...defaultReactions }
      );

      setReactions(updatedReactions);
    } catch (error) {
      console.error("Error fetching updated reactions:", error);
    }
  };

  // **Fetch user reaction after clicking**
  const fetchUserReaction = async () => {
    try {
      const userReactionRes = await AxiosClient.get(`/user/blogs/${blogId}/user-reaction`);
      setUserReaction(userReactionRes.data.reaction);
    } catch (error) {
      console.error("Error fetching user reaction:", error);
    }
  };

  // Add this function inside your ShowBlog component
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await AxiosClient.post(`/user/blogs/${blogId}/comments`, {
        comment_text: newComment,
      });

      if (response.status === 201) {
        // Add the new comment to the state (assuming response includes full comment data)
        setComments(prev => [response.data.comment, ...prev]);
        setNewComment(""); // Clear the comment input
        toast.success("Comment posted successfully!");
        // 🔹 Disable further commenting after posting a comment
        setIsCommentAllowed(false);
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error("Failed to post comment.");
    } finally {
      setIsSubmitting(false)
    }
  };

  const handleDownloadBlog = async (id: number | undefined) => {
    try {
      if (!id || isDownloading) return; // Prevent multiple clicks

      setIsDownloading(true);
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
        setIsDownloading(false)
      }, 100);

    } catch (error) {
      toast.error("Download failed");
      console.error("Download error:", error);
      setIsDownloading(false); // Re-enable on error
    }
  };

  if (error) return <PageNotFound />;

  return (
    <div className="bg-gray-300 min-h-screen flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-6 pt-24 flex flex-col items-center flex-grow">
        <Card className="max-w-3xl w-full shadow-lg border border-gray-200 rounded-lg bg-white">
          <CardContent className="p-6 h-160 overflow-y-auto">
            {/* Reaction Section */}
            <div className="relative mb-4">
              <div className="flex justify-center gap-4">
                {Object.entries(reactionEmojis).map(([reaction, emoji]) => (
                  <button
                    key={reaction}
                    className={`relative flex flex-col items-center text-xl ${userReaction === reaction ? "text-blue-600" : "text-gray-500"
                      }`}
                    onClick={() => handleReactionClick(reaction)}
                  >
                    {emoji}
                    <span className="absolute top-[-10px] right-[-5px] bg-gray-800 text-white text-xs font-mono px-2 py-1 rounded-full">
                      {reactions[reaction] || 0}
                    </span>
                  </button>
                ))}
              </div>

              <Download
                className={`absolute right-0 top-1/3 -translate-y-1/2 ${isDownloading ? "text-gray-400 cursor-not-allowed" : "text-gray-700 hover:text-black cursor-pointer"}`}
                size={21}
                onClick={() => handleDownloadBlog(blog?.id)}
              />
            </div>


            {/* Blog Content */}
            {blog ? (
              <>
                <CardTitle className="text-3xl font-bold text-[#1E40AF]">{blog.title}</CardTitle>
                <CardDescription className="text-gray-600 mt-2">{blog.description}</CardDescription>
                <div className="mt-4 text-lg text-gray-800 w-full max-w-full overflow-x-auto">
                  <div className="min-w-[600px] md:min-w-full prose" dangerouslySetInnerHTML={{ __html: blog.content }} />
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500">Loading...</div>
            )}
          </CardContent>
        </Card>

        {/* Comments Section */}
        <div className="max-w-3xl w-full mt-6 bg-white p-6 shadow-lg border border-gray-200 rounded-lg">
          <h2 className="text-2xl font-semibold text-[#1E40AF] mb-4">Comments</h2>
          {comments.length > 0 ? (
            <ul className="space-y-4">
              {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No comments yet. Be the first to comment!</p>
          )}
          {blog?.comments_enabled === "no" ? (
            <p className="text-red-500 text-sm mb-2">
              Comments are disabled for this blog.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4">
              <textarea
                className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                rows={3}
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={!isCommentAllowed}
              />
              <button
                type="submit"
                className="mt-2 bg-[#1E40AF] text-white px-4 py-2 rounded-md hover:bg-[#122E8A] transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={!isCommentAllowed || isSubmitting || !newComment.trim()}
              >
                {isSubmitting ? "Posting..." : "Post Comment"}
              </button>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

type CommentProps = {
  comment: Comment
}

const CommentItem: React.FC<CommentProps> = ({ comment }) => {
  const [expanded, setExpanded] = useState(false);
  const isLongComment = comment.content.length > 100;

  return (
    <li className="p-3 border border-gray-300 rounded-lg">
      <p className="text-gray-800 break-words whitespace-normal justify-between flex">
        <strong>{comment.username}</strong>
        <p className="text-sm text-gray-500">{new Date(comment.created_at).toLocaleString()}</p>
      </p>

      <div
        className={`mb-3 break-words whitespace-normal overflow-hidden transition-all ${!expanded && isLongComment ? "line-clamp-3" : ""
          }`}
      >
        {comment.content}
      </div>

      {isLongComment && (
        <div className="text-end">
          <button
            className="text-blue-500 text-sm underline-none mt-2"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Read Less" : "Read More..."}
          </button>
        </div>
      )}
    </li>
  );
};

export default ShowBlog;

