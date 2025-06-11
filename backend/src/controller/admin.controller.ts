import { queryDB } from "../config/db";
import { Response, Request, query, response } from "express";
import nodemailer from "nodemailer";
import sanitizeHtml from "sanitize-html";
import slugify from "slugify";

export const Statistics = async function (req: Request, res: Response): Promise<void> {

    try {
        const usersQuery = `SELECT COUNT(*) AS total_users FROM blog.users WHERE role = $1`
        const blogQuery = `SELECT COUNT(*) AS total_blogs FROM blog.blogs`
        const commentsQuery = `SELECT COUNT(*) AS total_comments FROM blog.comments`
        const reactionsQuery = `SELECT COUNT(*) AS total_reactions FROM blog.reactions`

        const [usersResponse, blogResponse, commentResponse, reactionResponse] = await Promise.all([
            queryDB(usersQuery, ['user']),
            queryDB(blogQuery, []),
            queryDB(commentsQuery, []),
            queryDB(reactionsQuery, []),
        ]);

        const totalUsers = usersResponse[0]?.total_users || 0
        const toalBlogs = blogResponse[0]?.total_blogs || 0
        const totalComments = commentResponse[0]?.total_comments || 0
        const totalReactions = reactionResponse[0]?.total_reactions || 0

        res.status(201).json({ total_users: totalUsers, total_blogs: toalBlogs, 
            total_comments: totalComments, total_reaction: totalReactions 
        });
        return;
    } catch (error) {
        console.error("Error fetching statistics:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }

};

export const usersList = async function (req: Request, res: Response): Promise<void> {
    try {
        const tableName = 'blog.users'

        const response = await queryDB(`SELECT id, username, email, created_at as joined_at FROM ${tableName} 
            WHERE role = $1 ORDER BY created_at DESC`,
            ['user']
        );

        if (response.length > 0) {
            res.status(200).json({ response })
            return;
        }
    } catch (error) {
        console.error("Error fetching details:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const deletUser = async function (req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params

        if (!id) {
            res.status(400).json({ message: "User ID is required" });
            return;
        }

        const tableName = 'blog.users'
        const tableName1 = "blog.deletedusers"

        const userExists = await queryDB(`SELECT * FROM ${tableName} WHERE id = $1`, [id]);

        if (userExists.length === 0) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const query2 = `INSERT INTO ${tableName1} (user_id, username, email) VALUES($1, $2, $3)`
        await queryDB(query2, [id, userExists[0]["username"], userExists[0]["email"]])

        // Delete the user
        await queryDB(`DELETE FROM ${tableName} WHERE id = $1`, [id]);
        
        // Check if the email exists in newsletterusers before deleting
        const newsletterUserCheck = await queryDB(`SELECT * FROM ${newsletterTable} WHERE email = $1`, userExists[0]["email"]);
        if (newsletterUserCheck.length > 0) {
            await queryDB(`DELETE FROM ${newsletterTable} WHERE email = $1`, userExists[0]["email"]);
        }

        res.status(200).json({ message: "User deleted successfully" });
        return;
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const addBlog = async function (req: Request, res: Response): Promise<void> {
    try {
        const tableName = "blog.blogs"

        const { title, description, content, subcategory_id } = req.body;
        const user = (req as any).user

        if (user.role != 'admin') {
            res.status(401).json({ success: false, message: "Unauthorized: Admin ID is missing." });
            return;
        };

        let coverImageBuffer = null;
        if (req.file) {
            coverImageBuffer = req.file.buffer;
        }

        const slug = slugify(title, { lower: true, strict: true });


        const insertBlogQuery = `INSERT INTO ${tableName} (title, content, description, author_id, subcategory_id, cover_image, slug) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
        `

        const result = await queryDB(insertBlogQuery, [title, content, description, user.userId, subcategory_id, 
            coverImageBuffer, slug]
        );
        const blog = result[0]

        const query1 = await queryDB(`SELECT email FROM blog.newsletterusers`)

        const emailSet = new Set<string>();
        [...query1].forEach((row: any) => emailSet.add(row.email));
        const emailList = Array.from(emailSet)


        const failedEmails: string[] = [];
        await Promise.all(
            Array.from(emailSet).map(async (email) => {
                try {
                    await sendBlogEmail(email, blog);
                } catch (error) {
                    failedEmails.push(email);
                }
            })
        );

        res.status(201).json({ success: true, message: "Blog added successfully", blog: result });
    } catch (error) {
        console.error("Error adding blog:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const getAllBlogForAmdin = async function (req: Request, res: Response): Promise<void> {
    try {
        const tableName = "blog.blogs";
        const user = (req as any).user;

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 6;
        const offset = (page - 1) * limit;
        const search = (req.query.search as string)?.trim().toLowerCase();

        let whereConditions = [`b.author_id = $1`];
        let queryParams: any[] = [user.userId];

        if (search) {
            whereConditions.push(`(LOWER(b.title) LIKE $2 OR LOWER(b.description) LIKE $2 OR LOWER(b.content) LIKE $2)`);
            queryParams.push(`%${search}%`);
        }

        const whereClause = `WHERE ${whereConditions.join(" AND ")}`;

        // COUNT Query
        const countQuery = `SELECT COUNT(*) FROM ${tableName} AS b ${whereClause}`;
        const countResult = await queryDB(countQuery, queryParams);
        const totalCount = parseInt(countResult[0].count);

        // Now add limit + offset for the data query
        const dataQueryParams = [...queryParams, limit, offset];

        const dataQuery = `
        SELECT 
          b.id, 
          b.title, 
          b.description, 
          b.created_at, 
          b.updated_at, 
          b.comments_enabled,
          COUNT(DISTINCT c.id) AS comment_count, 
          COUNT(DISTINCT r.id) AS reaction_count
        FROM ${tableName} AS b
        LEFT JOIN blog.comments AS c ON b.id = c.blog_id
        LEFT JOIN blog.reactions AS r ON b.id = r.blog_id
        ${whereClause}
        GROUP BY b.id
        ORDER BY b.updated_at DESC
        LIMIT $${dataQueryParams.length - 1} OFFSET $${dataQueryParams.length}
      `;

        const result = await queryDB(dataQuery, dataQueryParams);

        res.status(200).json({
            success: true,
            blogs: result,
            pagination: {
                total: totalCount,
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching blogs:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const deleteBlog = async function (req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params
        const tableName1 = "blog.blogs"
        const tableName2 = "blog.deletedblogs"

        if (!id) {
            res.status(400).json({ message: "Blog ID is required" });
            return;
        }

        const BlogExists = await queryDB(`SELECT * FROM ${tableName1} WHERE id = $1`, [id]);

        if (BlogExists.length == 0) {
            res.status(404).json({ message: "Blog not found" });
            return;
        }

        const query2 = `INSERT INTO ${tableName2} (title, content, author_id, created_at, updated_at, 
            blog_id, description, subcategory_id, cover_image, slug) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8 ,$9, $10)
        `

        await queryDB(query2, [BlogExists[0]["title"], BlogExists[0]["content"], BlogExists[0]["author_id"], BlogExists[0]["created_at"], 
            BlogExists[0]["updated_at"], id, BlogExists[0]["description"], BlogExists[0]["subcategory_id"], 
            BlogExists[0]["cover_image"], BlogExists[0]["slug"]]
        );

        const query = `DELETE FROM ${tableName1} WHERE id = $1 RETURNING *`

        await queryDB(query, [id])

        res.status(201).json({ success: true, message: "Deleted successfully" });
    } catch (error) {
        console.error("Error deleting blog:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const editBlog = async function (req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const tableName = "blog.blogs";

        if (req.method === "GET") {
            const query = `
                  SELECT id, title, description, content, subcategory_id 
                  FROM ${tableName} 
                  WHERE id = $1
              `;
            const response = await queryDB(query, [id]);

            if (response.length === 0) {
                res.status(404).json({ success: false, message: "Blog not found" });
                return;
            }

            const subcategoryQuery = `SELECT id, name, category_id FROM blog.subcategories WHERE id = $1`;
            const subcategoryData = await queryDB(subcategoryQuery, [response[0]["subcategory_id"]]);

            if (subcategoryData.length === 0) {
                res.status(404).json({ success: false, message: "Subcategory not found" });
                return;
            }

            const categoryQuery = `SELECT id, name FROM blog.categories WHERE id = $1`;
            const categoryData = await queryDB(categoryQuery, [subcategoryData[0]["category_id"]]);

            if (categoryData.length === 0) {
                res.status(404).json({ success: false, message: "Category not found" });
                return;
            }

            res.status(200).json({
                success: true,
                message: "Fetched successfully",
                result: response,
                category: categoryData[0],
                subcategory: subcategoryData[0],
            });
            return;
        } else if (req.method === "PUT") {
            const { title, description, content, subcategory_id } = req.body;

            const checkQuery = `SELECT * FROM ${tableName} WHERE id = $1`;
            const existingBlog = await queryDB(checkQuery, [id]);

            if (existingBlog.length === 0) {
                res.status(404).json({ success: false, message: "Blog not found" });
                return;
            }

            let updateQuery: string;
            let updateParams: any[];

            if (req.file) {
                const coverImageBuffer = req.file.buffer;
                updateQuery = `
            UPDATE ${tableName} 
            SET title = $1, description = $2, content = $3, subcategory_id = $4, cover_image = $5
            WHERE id = $6 RETURNING *
          `;
                updateParams = [title, description, content, subcategory_id, coverImageBuffer, id];
            } else {
                updateQuery = `
            UPDATE ${tableName} 
            SET title = $1, description = $2, content = $3, subcategory_id = $4
            WHERE id = $5 RETURNING *
          `;
                updateParams = [title, description, content, subcategory_id, id];
            }

            const updatedBlog = await queryDB(updateQuery, updateParams);

            res.status(200).json({ success: true, message: "Updated successfully", result: updatedBlog });
            return;
        } else {
            res.status(405).json({ success: false, message: "Method not allowed" });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const deletdUsersList = async function name(req: Request, res: Response): Promise<void> {
    try {
        const tableName = "blog.deletedusers"

        const query = `SELECT * FROM ${tableName}`

        const response = await queryDB(query, [])

        if (response.length > 0) {
            res.status(200).json({ response })
            return;
        }

    } catch (error) {
        console.error("Error fetching details:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getComments = async (req: Request, res: Response): Promise<void> => {
    try {
        const tableName1 = "blog.comments";
        const tableName2 = "blog.users";
        const { id: blogId } = req.params;

        if (!blogId || isNaN(Number(blogId))) {
            res.status(400).json({ message: "Valid blogId is required" });
            return;
        }

        const query = `
            SELECT c.id, c.content, c.created_at, u.username
            FROM ${tableName1} AS c
            LEFT JOIN ${tableName2} AS u ON c.user_id = u.id
            WHERE c.blog_id = $1
            ORDER BY c.created_at DESC
        `;

        const result = await queryDB(query, [Number(blogId)]);

        res.status(200).json({ result });
        return;
    } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ message: "Internal Server Error" });
        return;
    }
};

export const deleteComments = async (req: Request, res: Response): Promise<void> => {
    try {
        const tableName1 = "blog.comments";
        const { id: commentId } = req.params;

        if (!commentId || isNaN(Number(commentId))) {
            res.status(400).json({ message: "Id is required" })
            return;
        }

        const query = `
            DELETE FROM ${tableName1} WHERE id = $1 RETURNING *
        `

        const response = await queryDB(query, [commentId])

        if (response.length === 0) {
            res.status(404).json({ message: "Comment not found" });
            return;
        }

        res.status(200).json({ message: "Comment deleted successfully" })
        return;
    } catch (error) {
        console.error("Error deleting comments:", error);
        res.status(500).json({ message: "Internal Server Error" });
        return;
    }
};

export const getBlogReactions = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id: blogId } = req.params;

        if (!blogId || isNaN(Number(blogId))) {
            res.status(400).json({ message: "Invalid blog ID" });
            return;
        }

        const query = `
            SELECT reaction_type, COUNT(*) as count
            FROM blog.reactions
            WHERE blog_id = $1
            GROUP BY reaction_type;
        `;

        const result = await queryDB(query, [blogId]);

        const formattedData = Array.isArray(result) && result.length > 0
            ? result.map((row: { reaction_type: string; count: string }) => ({
                label: row.reaction_type,
                value: Number(row.count),
            }))
            : [];

        res.status(200).json({ reactions: formattedData });
    } catch (error) {
        console.error("Error fetching reactions:", error);
        res.status(500).json({ message: "Internal Server Error", reactions: [] });
    }
};

export const reactionDetails = async (req: Request, res: Response): Promise<void> => {
    try {
        const tableName = "blog.reactions"
        const tableName1 = "blog.users"
        const { id: blogId } = req.params

        if (!blogId || isNaN(Number(blogId))) {
            res.status(400).json({ message: "Invalid blog ID" });
            return;
        }

        const query = `
            SELECT r.reaction_type, r.created_at, u.username
            FROM ${tableName} AS r
            LEFT JOIN ${tableName1} AS u ON r.user_id = u.id
            WHERE blog_id = $1
        `

        const response = await queryDB(query, [Number(blogId)])

        if (!response || !Array.isArray(response) || response.length == 0) {
            res.status(200).json({ message: "No reactions available", reactions: [] });
            return;
        }

        res.status(200).json({ response });

    } catch (error) {
        console.error("Error fetching reactions:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const deletdBlogList = async function (req: Request, res: Response): Promise<void> {
    try {
        const tableName = "blog.deletedblogs";

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 6;
        const offset = (page - 1) * limit;
        const search = (req.query.search as string)?.trim().toLowerCase();

        // Prepare WHERE clause
        let whereClause = "";
        const queryParams: any[] = [];

        if (search) {
            whereClause = `WHERE LOWER(title) LIKE $1 OR LOWER(description) LIKE $1 OR LOWER(content) LIKE $1`;
            queryParams.push(`%${search}%`);
        }

        // Count query
        const countQuery = `SELECT COUNT(*) FROM ${tableName} ${whereClause}`;
        const countResult = await queryDB(countQuery, queryParams);
        const total = parseInt(countResult[0].count);

        // Data query (add limit + offset)
        const dataQuery = `
        SELECT * FROM ${tableName}
        ${whereClause}
        ORDER BY updated_at DESC
        LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
      `;
        const response = await queryDB(dataQuery, [...queryParams, limit, offset]);

        res.status(200).json({
            success: true,
            blogs: response,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        });
    } catch (error) {
        console.error("Error fetching deleted blogs:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const fetchCategories = async function (req: Request, res: Response): Promise<void> {
    try {
        const tableName = "blog.categories";

        const query = `SELECT * FROM ${tableName}`

        const result = await queryDB(query, [])

        res.status(200).json({ data: result })
    } catch (error) {
        res.status(404).json({ error: "server error" })
    }

};

export const fetchSubCategories = async function (req: Request, res: Response): Promise<void> {
    try {
        const tableName = "blog.subcategories";

        const query = `SELECT * FROM ${tableName}`

        const result = await queryDB(query, [])

        res.status(200).json({ data: result })
    } catch (error) {
        res.status(404).json({ error: "server error" })
    }

};

export const deleteSubCategories = async function (req: Request, res: Response): Promise<void> {
    try {
        const tableName2 = "blog.subcategories";
        const tableName3 = "blog.blogs";
        const tableName4 = "blog.deletedblogs";
        const tableName5 = "blog.draftblogs";
        const { id: subcategory_id } = req.params;

        // First delete all associated blogs from all tables
        await Promise.all([
            queryDB(`DELETE FROM ${tableName3} WHERE subcategory_id = $1`, [subcategory_id]),
            queryDB(`DELETE FROM ${tableName4} WHERE subcategory_id = $1`, [subcategory_id]),
            queryDB(`DELETE FROM ${tableName5} WHERE subcategory_id = $1`, [subcategory_id])
        ]);

        // Then delete the subcategory itself
        await queryDB(`DELETE FROM ${tableName2} WHERE id = $1`, [subcategory_id]);

        res.status(200).json({ 
            success: true, 
            message: "Subcategory and associated blogs deleted successfully." 
        });
    } catch (error) {
        console.error("Error in deleting subcategory:", error);
        res.status(500).json({ 
            error: "Error in deleting subcategory",
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const deleteCategories = async function (req: Request, res: Response): Promise<void> {
    try {
        const tableName1 = "blog.categories";
        const tableName2 = "blog.subcategories";
        const tableName3 = "blog.blogs";
        const tableName4 = "blog.deletedblogs";
        const tableName5 = "blog.draftblogs";

        const { id: category_id } = req.params;

        // First get all subcategory IDs for this category
        const subcategories = await queryDB(`SELECT id FROM ${tableName2} WHERE category_id = $1`, [category_id]);
        const subcategoryIds = subcategories.map(row => row.id);
        console.log(subcategories, subcategoryIds);
        

        // Perform deletions in parallel where possible
        await Promise.all([
            // Delete all blogs related to these subcategories
            subcategoryIds.length > 0 ? queryDB(`DELETE FROM ${tableName3} WHERE subcategory_id = ANY($1)`, [subcategoryIds]) : Promise.resolve(),
            subcategoryIds.length > 0 ? queryDB(`DELETE FROM ${tableName4} WHERE subcategory_id = ANY($1)`, [subcategoryIds]) : Promise.resolve(),
            subcategoryIds.length > 0 ? queryDB(`DELETE FROM ${tableName5} WHERE subcategory_id = ANY($1)`, [subcategoryIds]) : Promise.resolve(),
            
            // Delete all subcategories for this category
            queryDB(`DELETE FROM ${tableName2} WHERE category_id = $1`, [category_id]),
        ]);

        // Finally delete the category itself
        await queryDB(`DELETE FROM ${tableName1} WHERE id = $1`, [category_id]);

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ 
            error: "Error in deleting category",
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const addCategory = async function (req: Request, res: Response): Promise<void> {
    try {
        const tableName = "blog.categories";
        const { name } = req.body;

        if (!name || name.trim() === "") {
            res.status(400).json({ message: "Provide a valid category name" });
            return;
        }

        const categoryExists = await queryDB(`SELECT * FROM ${tableName} WHERE name = $1`, [name]);

        if (categoryExists.length > 0) {
            res.status(409).json({ message: "This category already exists" });
            return;
        }

        const query = `INSERT INTO ${tableName} (name) VALUES ($1)`;
        await queryDB(query, [name]);

        res.status(201).json({ success: true, message: "Category added successfully" });
    } catch (error) {
        console.error("Error adding category:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const addSUbCategory = async function (req: Request, res: Response): Promise<void> {
    try {
        const tableName = "blog.subcategories";
        const { category_id, name } = req.body;


        if (!name || name.trim() === "") {
            res.status(400).json({ message: "Provide a valid subcategory name" });
            return;
        }

        const subCategoryExists = await queryDB(`SELECT * FROM ${tableName} WHERE name = $1`, [name]);

        if (subCategoryExists.length > 0) {
            res.status(409).json({ message: "This subcategory already exists" });
            return;
        }

        const query = `INSERT INTO ${tableName} (name, category_id) VALUES ($1, $2)`;
        await queryDB(query, [name, category_id]);

        res.status(201).json({ success: true, message: "SubCategory added successfully" });
    } catch (error) {
        console.error("Error adding category:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const fetchSubCategoriesOnCategories = async function (req: Request, res: Response): Promise<void> {
    const { category_id } = req.query
    if (!category_id) {
        res.status(400).json({ error: "category is required" });
        return;
    }
    try {
        const subcategories = await queryDB(`SELECT * FROM blog.subcategories WHERE category_id = $1`, [category_id])

        res.status(201).json({ subcategories })
    } catch (error) {
        console.error("Error fetching subcategories:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const statsForCategories = async function (req: Request, res: Response): Promise<void> {
    try {
        const tableName = "blog.categories"
        const tableName1 = "blog.subcategories"
        const tableName2 = "blog.blogs"

        const categories = await queryDB(
            `SELECT c.name, COUNT(s.id) as subcategory_count 
            FROM ${tableName} c 
            LEFT JOIN ${tableName1} s ON c.id = s.category_id 
            GROUP BY c.id`, []
        )

        const subcategories = await queryDB(
            `SELECT s.name, COUNT(b.id) as blog_count
            FROM ${tableName1} s
            LEFT JOIN ${tableName2} b ON s.id = b.subcategory_id
            GROUP BY s.id`, []
        )

        res.status(200).json({
            success: true,
            categoryData: categories,
            subcategoryData: subcategories
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error fetching category stats" });
    }
};

export const addBlogAgain = async function (req: Request, res: Response): Promise<void> {
    try {
        const tableName = "blog.deletedblogs";
        const tableName1 = "blog.blogs";

        const { blog_id, category_id, subcategory_id } = req.body;
        
        const blogExists = await queryDB(`SELECT * FROM ${tableName} WHERE id = $1`, [blog_id]);

        if (blogExists.length > 0) {
            const query = `
                INSERT INTO ${tableName1} (title, content, author_id, created_at, description, subcategory_id, cover_image, slug) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `;
            
            await queryDB(query, [
                blogExists[0]["title"],
                blogExists[0]["content"],
                blogExists[0]["author_id"],
                blogExists[0]["created_at"],
                blogExists[0]["description"],
                subcategory_id,
                blogExists[0]["cover_image"],
                blogExists[0]["slug"]
            ]);
            
            await queryDB(`DELETE FROM ${tableName} WHERE id = $1`, [blog_id]);

            res.status(201).json({ success: true, message: "Blog restored successfully!" });
        } else {
            res.status(404).json({ error: "Blog not found in deletedblogs" });
        }
    } catch (error) {
        console.error("Error in addBlogAgain:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const addDraftBlog = async (req: Request, res: Response): Promise<void> => {
    try {
        const tableName = "blog.draftblogs";

        const { title, description, content, subcategory_id } = req.body
        const user = (req as any).user;

        if (user.role != 'admin') {
            res.status(401).json({ success: false, message: "Unauthorized: Admin ID is missing." });
            return;
        };

        let coverImageBuffer = null;
        if (req.file) {
            coverImageBuffer = req.file.buffer;
        }

        const slug = slugify(title, {lower: true, strict: true});
        
        const blogExists = await queryDB(`SELECT title, description, content, author_id, subcategory_id, slug FROM ${tableName} 
            WHERE title = $1 AND description = $2 AND
            content = $3 AND author_id = $4 AND subcategory_id = $5 AND slug = $6` , 
            [title, description, content, user.userId, subcategory_id, slug]
        );

        if (blogExists.length != 0) {
            res.status(400).json({ success: false, message: "Blog already exists!" })
            return;
        }

        const query = `INSERT INTO ${tableName} (title, description, content, author_id, subcategory_id, cover_image, slug) VALUES ($1, $2, $3, $4, $5, $6, $7)`
        const result = await queryDB(query, [title, description, content, user.userId, subcategory_id, coverImageBuffer, slug])

        res.status(201).json({
            success: true,
            result,
            message: "added successfully as draft blog"
        });
    } catch (error) {
        console.error("Error fetching draft blogs:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const fetchDraftBlogs = async (req: Request, res: Response): Promise<void> => {
    try {
        const tableName = "blog.draftblogs";

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 6;
        const offset = (page - 1) * limit;
        const search = (req.query.search as string)?.trim().toLowerCase();

        let whereClause = "";
        const queryParams: any[] = [];

        if (search) {
            whereClause = `WHERE LOWER(title) LIKE $1 OR LOWER(description) LIKE $1 OR LOWER(content) LIKE $1`;
            queryParams.push(`%${search}%`);
        }

        const countQuery = `SELECT COUNT(*) FROM ${tableName} ${whereClause}`;
        const countResult = await queryDB(countQuery, queryParams);
        const total = parseInt(countResult[0].count);

        const dataQuery = `
          SELECT * FROM ${tableName}
          ${whereClause}
          ORDER BY updated_at DESC
          LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
        `;
        const result = await queryDB(dataQuery, [...queryParams, limit, offset]);

        res.status(200).json({
            success: true,
            result,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        });
    } catch (error) {
        console.error("Error fetching draft blogs:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const publishDraftBlogs = async (req: Request, res: Response): Promise<void> => {
    try {
        const { blog_id } = req.body

        const blogExists = await queryDB(`SELECT * FROM blog.draftblogs WHERE id = $1`, [blog_id])

        if (blogExists.length == 0) {
            res.status(400).json({ message: "Blog doesn't exist" })
            return;
        }

        await queryDB(`INSERT INTO blog.blogs (title, content, author_id, description, subcategory_id, cover_image, slug) 
            VALUES ($1, $2, $3, $4, $5, $6, $7)`, 
        [
            blogExists[0]["title"], blogExists[0]["content"], blogExists[0]["author_id"], blogExists[0]["description"], 
            blogExists[0]["subcategory_id"], blogExists[0]["cover_image"], blogExists[0]["slug"]
        ]
        );

        await queryDB(`DELETE FROM blog.draftblogs WHERE id = $1`, [blog_id]);

        res.status(201).json({ success: true, message: "Blog is published" })
    } catch (error) {
        res.status(500).json({ message: "internal server error" })
    }
};

export const getEngagement = async (req: Request, res: Response): Promise<void> => {
    try {
        const { startDate, endDate } = req.query;

        const query = `
            WITH date_series AS (
                SELECT generate_series($1::DATE, $2::DATE, '1 day') AS date
            )
            SELECT 
                TO_CHAR(ds.date, 'Mon DD') AS date, 
                COALESCE(SUM(reactions), 0) AS reactions,
                COALESCE(SUM(comments), 0) AS comments,
                COALESCE(SUM(views), 0) AS views
            FROM date_series ds
            LEFT JOIN (
                SELECT 
                    created_at::DATE AS date, 
                    COUNT(DISTINCT id::BIGINT) AS reactions,  -- No reaction_type filter
                    NULL::BIGINT AS comments,
                    NULL::BIGINT AS views
                FROM blog.reactions
                WHERE created_at::DATE BETWEEN $1::DATE AND $2::DATE
                GROUP BY created_at::DATE
                
                UNION ALL
                
                SELECT 
                    created_at::DATE AS date, 
                    NULL::BIGINT AS reactions,
                    COUNT(DISTINCT id::BIGINT) AS comments, 
                    NULL::BIGINT AS views
                FROM blog.comments
                WHERE created_at::DATE BETWEEN $1::DATE AND $2::DATE
                GROUP BY created_at::DATE
                
                UNION ALL
                
                SELECT 
                    viewed_at::DATE AS date, 
                    NULL::BIGINT AS reactions,
                    NULL::BIGINT AS comments,
                    COUNT(DISTINCT blog_id) AS views
                FROM blog.views
                WHERE viewed_at::DATE BETWEEN $1::DATE AND $2::DATE
                GROUP BY viewed_at::DATE
            ) ed ON ds.date = ed.date
            GROUP BY ds.date
            ORDER BY ds.date ASC;
        `;

        const engagementData = await queryDB(query, [startDate, endDate]);

        res.status(200).json({ engagementData });

    } catch (error) {
        console.error("Error fetching engagement data:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const viewCount = async (req: Request, res: Response): Promise<void> => {
    try {
        if (req.method === "POST") {
            const { blog_id } = req.body;
            let ip_address = req.ip;
            const user = (req as any).user; 

            
            if (!blog_id) {
                res.status(400).json({ message: "Select a blog" });
                return;
            }

            
            const blogExists = await queryDB(`SELECT id FROM blog.blogs WHERE id = $1`, [blog_id]);
            if (blogExists.length === 0) {
                res.status(400).json({ message: "Blog is not active" });
                return;
            }

            
            if (ip_address === "::1") {
                ip_address = "127.0.0.1";
            }

            if (user && user.userId) {
                // LOGGED-IN USER (Unique on blog_id & user_id)
                await queryDB(
                    `INSERT INTO blog.views (blog_id, user_id, viewed_at) 
                     VALUES ($1, $2, NOW()) 
                     ON CONFLICT (blog_id, user_id) 
                     DO UPDATE SET viewed_at = NOW() 
                     WHERE blog.views.viewed_at < NOW() - INTERVAL '1 hour'`,
                    [blog_id, user.userId]
                );
            } else {
                // ANONYMOUS USER (Unique on blog_id & ip_address)
                await queryDB(
                    `INSERT INTO blog.views (blog_id, ip_address, viewed_at) 
                     VALUES ($1, $2, NOW()) 
                     ON CONFLICT (blog_id, ip_address) 
                     DO UPDATE SET viewed_at = NOW() 
                     WHERE blog.views.viewed_at < NOW() - INTERVAL '1 hour'`,
                    [blog_id, ip_address]
                );
            }

            res.status(201).json({ message: "View recorded" });
        }
    } catch (error) {
        res.status(500).json({ error });
    }
};

export const viewCount2 = async (req: Request, res: Response): Promise<void> => {
    try {
        if (req.method === "POST") {
            const { blog_id } = req.body;
            let ip_address = req.ip;

            
            if (!blog_id) {
                res.status(400).json({ message: "Select a blog" });
                return;
            }

            
            const blogExists = await queryDB(`SELECT id FROM blog.blogs WHERE id = $1`, [blog_id]);
            if (blogExists.length === 0) {
                res.status(400).json({ message: "Blog is not active" });
                return;
            }

            // Normalize localhost IP
            if (ip_address === "::1") {
                ip_address = "127.0.0.1";
            }

            // Prevent multiple views from same user/IP within 1 hour
            await queryDB(
                `INSERT INTO blog.views (blog_id, user_id, ip_address, viewed_at) 
                 VALUES ($1, NULL, $2, NOW())
                 ON CONFLICT (blog_id, ip_address) 
                 DO UPDATE SET viewed_at = NOW() 
                 WHERE blog.views.viewed_at < NOW() - INTERVAL '1 hour'`,
                [blog_id, ip_address]
            );

            res.status(201).json({ message: "View recorded" });
        }
    } catch (error) {
        res.status(500).json({ error });
    }
};

const sendBlogEmail = async (email: string, blog: any) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const unsubscribeUrl = `${process.env.FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(email)}`;
        const blogUrl = `${process.env.FRONTEND_URL}/blogs`;

        // Strip all HTML for the excerpt preview
        const plainTextExcerpt = sanitizeHtml(blog.content, {
            allowedTags: [],
            allowedAttributes: {},
        }).substring(0, 200);

        const mailOptions = {
            from: `"MyBlog" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `📝 New Blog Published: ${blog.title}`,
            html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1E40AF;">📝 New Blog: ${blog.title}</h2>
        <p style="margin-bottom: 10px;"><strong>Description:</strong> ${blog.description}</p>

        <div style="background-color: #f9f9f9; border-left: 5px solid #1E40AF; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <p style="margin: 0; color: #333;">${plainTextExcerpt}...</p>
        </div>

        <a href="${blogUrl}" style="display: inline-block; background-color: #1E40AF; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">
            👉 Read Full Blog
        </a>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">

        <p style="margin-top: 20px; color: #555;">
            If you no longer wish to receive these emails,
            <a href="${unsubscribeUrl}" style="color: red;">click here to unsubscribe</a>.
        </p>

        <div style="margin-top: 30px; color: #666;">
            <p>Best regards,</p>
            <p><strong>The Blog Team</strong></p>
        </div>
    </div>
`
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error(`❌ Error sending blog email to ${email}:`, error);
    }
};

export const fetchRequestForAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        const query = `
        SELECT 
          br.*, 
          u.username as user_name 
        FROM blog.blog_requests br 
        JOIN blog.users u 
        ON br.user_id = u.id
      `;

        const response = await queryDB(query, []);

        if (response.length === 0) {
            res.status(400).json({ message: "No request made" });
            return;
        }

        const pendingRequest = response.filter(data => data.status === "pending");
        const acceptedRequest = response.filter(data => data.status === "accepted");
        const rejectedRequest = response.filter(data => data.status === "rejected");

        res.status(200).json({ pendingRequest, acceptedRequest, rejectedRequest });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error });
    }
};

export const actionOnRequests = async (req: Request, res: Response): Promise<void> => {
    try {
        const { status } = req.body
        const { id } = req.params

        if (!id || !status) {
            res.status(400).json({ message: "select one action" })
            return;
        }

        const query = `UPDATE blog.blog_requests SET status = $1 WHERE id = $2`

        const response = await queryDB(query, [status, id])

        res.status(201).json({ message: "Updated Sucessfully" })
        return;
    } catch (error) {
        res.status(500).json({ message: "something went wrong!" })
        return;
    }
};

export const toggleCommnets = async (req: Request, res: Response): Promise<void> => {
    try {
        const tableName = "blog.blogs"
        const { id, comments_enabled } = req.body

        const query = `UPDATE ${tableName} SET comments_enabled = $1 WHERE id = $2`

        const response = await queryDB(query, [comments_enabled == "yes" ? "no" : "yes", id])

        res.status(201).json({ message: "success" });
        return;
    } catch (error) {
        res.status(500).json({ message: "internal server error!" })
    }
};
