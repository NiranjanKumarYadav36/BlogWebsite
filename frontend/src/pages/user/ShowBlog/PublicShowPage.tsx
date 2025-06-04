import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import AxiosClient from "../../../components/ApiClient/AxiosClient";
import { Card, CardContent, CardTitle, CardDescription } from "../../../components/ui/card";
import Header from "../../../components/Header/Header";
import Footer from "../../../components/Footer/Footer";
import PageNotFound from "../../../components/PageNotFound/PageNotFound";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";

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
}

interface Comment {
  id: number;
  blog_id: number;
  user_id: number;
  content: string;
  created_at: string;
  username: string;
}

type CommentProps = {
  comment: Comment
}

function PublicShowPage() {
  const location = useLocation();
  const blogId = location.state?.blogId
  const [blog, setBlog] = useState<Blog | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [reactions, setReactions] = useState<Record<string, number>>(defaultReactions);
  const [userReaction] = useState<string | null>(null);
  const [newComment, setNewComment] = useState<string>("");
  const [error, setError] = useState(false);
  const [isCommentAllowed, setIsCommentAllowed] = useState(false);
  const [isSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!blog?.id) return;
    const setView = async () => {
      try {
        const result = await AxiosClient.post("/admin/views2",
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
        const [blogRes, commentsRes, reactionsRes] = await Promise.all([
          AxiosClient.get(`/user/blogs/${blogId}`),
          AxiosClient.get(`/user/public_blogs/${blogId}/comments`),
          AxiosClient.get(`/user/blogs/${blogId}/reaction-summary`),
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
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(true);
      }
    };

    fetchData();
  }, [blogId]);

  const handleReactionClick = async () => {
    toast.error("Please login to react",)
    navigate("/login");
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.error("Please login to comment")
    navigate("/login");
  };

  if (error) return <PageNotFound />;

  return (
    <div className="bg-gray-300 min-h-screen flex flex-col">
      <Toaster position="top-center" />
      <Header />
      <div className="container mx-auto px-4 py-6 pt-24 flex flex-col items-center flex-grow">
        <Card className="max-w-3xl w-full shadow-lg border border-gray-200 rounded-lg bg-white">
          <CardContent className="p-6">
            {/* Reaction Section */}
            <div className="flex justify-center gap-4 mb-4">
              {Object.entries(reactionEmojis).map(([reaction, emoji]) => (
                <button
                  key={reaction}
                  className={`relative flex flex-col items-center text-xl ${userReaction === reaction ? "text-blue-600" : "text-gray-500"
                    }`}
                  onClick={() => handleReactionClick()}
                >
                  {emoji}
                  <span className="absolute top-[-10px] right-[-5px] bg-gray-800 text-white text-xs px-2 py-1 rounded-full">
                    {reactions[reaction] || 0}
                  </span>
                </button>
              ))}
            </div>

            {/* Blog Content */}
            {blog ? (
              <>
                <CardTitle className="text-3xl font-bold text-[#1E40AF]">{blog.title}</CardTitle>
                <CardDescription className="text-gray-600 mt-2">{blog.description}</CardDescription>
                <div className="mt-4 text-lg text-gray-800" dangerouslySetInnerHTML={{ __html: blog.content }} />
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
          <form onSubmit={handleCommentSubmit} className="mt-4">
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
        </div>
      </div>
      <Footer />
    </div>
  );
}





const CommentItem: React.FC<CommentProps> = ({ comment }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <li className="p-3 border border-gray-300 rounded-lg">
      <p className="text-gray-800 break-words whitespace-normal justify-between flex">
        <strong>{comment.username}</strong>
        <p className="text-sm text-gray-500">{new Date(comment.created_at).toLocaleString()}</p>
      </p>
      <div
        className={`mb-3 break-words whitespace-normal overflow-hidden transition-all ${expanded ? "" : "line-clamp-3"
          }`}
      >
        {comment.content}
      </div>
      {comment.content.length > 100 && (
        <div className="text-end">
          <button
            className="text-gray-400 text-sm underline-none mt-2"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Read Less" : "Read More..."}
          </button>
        </div>
      )}
    </li>
  );
};

export default PublicShowPage;