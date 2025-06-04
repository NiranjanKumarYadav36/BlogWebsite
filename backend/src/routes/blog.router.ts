import express from "express";
import { 
    registerAccount, loginHandle, logoutHandle, latestBlogForHomePage, 
    passwordChange, resetPassword, verifyOTP, newsletterSubscription, 
    newsletterUnSubscribe, 
    sendRegistrationOTP
} from "../controller/blog.controller";
import { actionOnRequests, addBlog, addBlogAgain, addCategory, 
    addSUbCategory, deletdBlogList, deletdUsersList, deleteBlog, 
    deleteCategories, deleteComments, deleteSubCategories, deletUser, 
    addDraftBlog, editBlog, fetchCategories, fetchDraftBlogs, 
    fetchRequestForAdmin, fetchSubCategories, fetchSubCategoriesOnCategories, 
    getAllBlogForAmdin, getBlogReactions, getComments, getEngagement, publishDraftBlogs, 
    reactionDetails, Statistics, statsForCategories, toggleCommnets, usersList, viewCount, 
    viewCount2 
} from "../controller/admin.controller";
import { addComment, addOrUpdateReaction, downloadBlog, fetchCategoriesForUser, 
    fetchComments, fetchComments_public, fetchReactions, fetchRequest, 
    fetchUserReaction, filterCategory, getAllBlogsForUser, makeRequest, 
    showBlog 
} from "../controller/user.controller";
import { authenticateJWT } from "../middlewares/authMiddleware";
import {upload} from "../middlewares/upload";

const route = express.Router();

route.get("/protected", authenticateJWT, (req: express.Request, res: express.Response) => {
    const user = (req as any).user;    
    res.status(200).json({ success: true, message: "You have access to this protected route!", user: user.role, username: user.username, email: user.email });
});

// blog
route.post("/register", registerAccount);
route.post("/login", loginHandle);
route.post("/logout", logoutHandle);
route.get("/latest_blogs", latestBlogForHomePage);
route.post("/forgot_password", passwordChange);
route.post("/verify-otp", verifyOTP);
route.post("/reset-password", resetPassword);
route.post("/newsletter/subscribe", newsletterSubscription);
route.get("/newsletter/unsubscribe", newsletterUnSubscribe);
route.post("/send-registration-otp", sendRegistrationOTP);

// admin
route.get("/admin/dashboard", Statistics);
route.get("/admin/users_list", usersList);
route.delete("/admin/users_list/:id", deletUser);
route.post("/admin/add_blog", authenticateJWT, upload.single("coverImage"), addBlog);
route.get("/admin/manage_blogs", authenticateJWT, getAllBlogForAmdin);
route.delete("/admin/delete_blogs/:id", deleteBlog);
route.get("/admin/edit_blog/:id", editBlog);
route.put("/admin/edit_blog/:id", upload.single("coverImage"), editBlog);
route.get("/admin/deleted_users_list", deletdUsersList);
route.get("/admin/manage_blogs/stats/:id", getComments);
route.delete("/admin/manage_blogs/delete_comment/:id", deleteComments);
route.get("/admin/manage_blogs/reactions/:id", getBlogReactions);
route.get("/admin/manage_blogs/table_reactions/:id", reactionDetails);
route.get("/admin/manage_blogs/deleted_blogs_list", deletdBlogList);
route.get("/admin/manage_categories/categories", fetchCategories);
route.get("/admin/manage_categories/subcategories", fetchSubCategories);
route.delete("/admin/manage_categories/delete_subcategories/:id", deleteSubCategories);
route.delete("/admin/manage_categories/delete_categories/:id", deleteCategories);
route.post("/admin/manage_categories/add_categories", addCategory);
route.post("/admin/manage_categories/add_subcategories", addSUbCategory);
route.get("/admin/add_blog/subcategories", fetchSubCategoriesOnCategories);
route.get("/admin/manage_categories/category_stats", statsForCategories);
route.post("/admin/manage_blogs/add_blog_to_active", addBlogAgain);
route.post("/admin/add_draft_blog", authenticateJWT, upload.single("coverImage"), addDraftBlog);
route.get("/admin/fetch_draft_blogs", fetchDraftBlogs);
route.post("/admin/publish_draft_blogs", publishDraftBlogs);
route.get("/admin/engagement", getEngagement);
route.get("/admin/views", viewCount);
route.post("/admin/views", authenticateJWT, viewCount);
route.post("/admin/views2", viewCount2);
route.get("/admin/user_requests", fetchRequestForAdmin);
route.put("/admin/user_requests/:id", actionOnRequests);
route.put("/admin/toggle_commnets", toggleCommnets);

// users
route.get("/user/blogs", getAllBlogsForUser);
route.get("/user/blogs/:id", showBlog);
route.get("/user/blogs/:id/comments", authenticateJWT, fetchComments);
route.post("/user/blogs/:id/comments", authenticateJWT, addComment);
route.get("/user/public_blogs/:id/comments", fetchComments_public); 
route.get("/user/blogs/:id/reaction-summary", fetchReactions)
route.post("/user/blogs/:id/reactions/add-reaction", authenticateJWT, addOrUpdateReaction);
route.get("/user/blogs/:id/user-reaction", authenticateJWT, fetchUserReaction)
route.get("/user/categories", fetchCategoriesForUser)
route.get("/user/categories/filter", filterCategory)
route.post("/user/requestblog", authenticateJWT, makeRequest);
route.get("/user/fetchrequest", authenticateJWT, fetchRequest);
route.get("/user/downloadBlog/:id", downloadBlog);

export default route;