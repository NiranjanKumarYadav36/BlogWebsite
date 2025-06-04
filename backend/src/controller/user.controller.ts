import { Request, response, Response } from "express";
import { queryDB } from "../config/db";
import puppeteer from "puppeteer";

export const getAllBlogsForUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const tableName = "blog.blogs";
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 6;
    const offset = (page - 1) * limit;
    const search = (req.query.search as string)?.trim().toLowerCase();

    let whereClause = "";
    let queryParams: any[] = [limit, offset];

    if (search) {
      whereClause = `
        WHERE LOWER(title) LIKE $3 OR LOWER(description) LIKE $3 OR LOWER(content) LIKE $3
      `;
      queryParams.push(`%${search}%`);
    }

    // Fetch blogs
    const blogQuery = `
      SELECT id, title, description, updated_at, cover_image 
      FROM ${tableName}
      ${whereClause}
      ORDER BY updated_at DESC 
      LIMIT $1 OFFSET $2
    `;
    const result = await queryDB(blogQuery, queryParams);

    // Count total blogs
    const countQueryParams = search ? [`%${search}%`] : [];
    const countQuery = `
      SELECT COUNT(*) FROM ${tableName}
      ${search ? `
        WHERE LOWER(title) LIKE $1 OR LOWER(description) LIKE $1 OR LOWER(content) LIKE $1
      ` : ''}
    `;
    const totalResult = await queryDB(countQuery, countQueryParams);
    const totalBlogs = parseInt(totalResult[0].count, 10);

    // Convert cover_image buffer to base64
    const blogsWithFullImageUrl = result.map((blog: any) => {
      let imageUrl = null;
      if (blog.cover_image) {
        const base64Image = Buffer.from(blog.cover_image).toString("base64");
        imageUrl = `data:image/jpeg;base64,${base64Image}`;
      }
      return {
        ...blog,
        cover_image: imageUrl,
      };
    });

    res.status(200).json({
      success: true,
      blogs: blogsWithFullImageUrl,
      totalBlogs,
      totalPages: Math.ceil(totalBlogs / limit),
      currentPage: page,
    });

  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const showBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const tableName = "blog.blogs";
    const { id } = req.params

    const query = `SELECT * FROM ${tableName} WHERE id = $1`;

    const result = await queryDB(query, [id])

    if (result.length !== 0) {
      res.status(200).json({ success: true, result: result[0] })
    } else {
      res.status(404).json({ sucess: false })
    }
  } catch (error) {
    res.status(500).json({ message: error })
  }
}

export const fetchComments = async (req: Request, res: Response): Promise<void> => {
  try {
    const tableName = "blog.comments";
    const usersTable = "blog.users";
    const { id } = req.params;
    const user = (req as any).user;

    const query = `
            SELECT c.id, c.blog_id, c.user_id, u.username, c.content, c.created_at 
            FROM ${tableName} AS c
            JOIN ${usersTable} AS u ON c.user_id = u.id
            WHERE c.blog_id = $1
            ORDER BY c.created_at DESC;
        `;

    const result = await queryDB(query, [id]);

    // Check if any of the comments belong to the user
    const userHasCommented = result.some(comment => comment.user_id == user.userId);

    if (userHasCommented) {
      res.status(200).json({ message: "Not allowed", comments: result });
      return;
    }

    res.status(201).json({ comments: result });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const fetchComments_public = async (req: Request, res: Response): Promise<void> => {
  try {
    const tableName = "blog.comments";
    const usersTable = "blog.users";
    const { id } = req.params;

    const query = `SELECT * FROM ${tableName} WHERE blog_id = $1`;
    const result = await queryDB(query, [id]);

    
    if (result.length === 0) {
      res.status(201).json({ comments: [] });
      return;
    }

    const userIds = result.map(comment => comment.user_id);
    const userQuery = `SELECT id, username FROM ${usersTable} WHERE id = ANY($1)`;
    const users = await queryDB(userQuery, [userIds]);

    const userMap = new Map(users.map(user => [user.id, user.username]));

    const commentsWithUsernames = result.map(comment => ({
      ...comment,
      username: userMap.get(comment.user_id) || "Unknown"
    }));

    res.status(201).json({ comments: commentsWithUsernames });

  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const tableName = "blog.comments"; 
    const blog_id = req.params.id;
    const { comment_text } = req.body;
    const user = (req as any).user

    if (!blog_id || !comment_text) {
      res.status(400).json({ message: "All fields are required" });
      return;
    };

    const query = `
            INSERT INTO ${tableName} (blog_id, user_id, content)
            VALUES ($1, $2, $3)
            RETURNING *;`;

    const result = await queryDB(query, [blog_id, user.userId, comment_text]);



    res.status(201).json({ message: "Comment added successfully", comment: result[0] });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const fetchReactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const tableName = 'blog.reactions'

    if (!id) {
      res.status(400).json({ message: "Blog ID is required" });
      return;
    }

    const query = `SELECT reaction_type, COUNT(*) as count FROM ${tableName} WHERE blog_id = $1 GROUP BY reaction_type`

    const summary = await queryDB(query, [id]);

    res.status(200).json({ summary });
  } catch (error) {
    console.error("Error fetching reactions:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const addOrUpdateReaction = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const user = (req as any).user;
  const { reaction_type } = req.body;
  const tableName = 'blog.reactions'

  try {
    // Check if user has already reacted
    const existingReaction = await queryDB(
      `SELECT id, reaction_type FROM ${tableName} WHERE user_id = $1 AND blog_id = $2`,
      [user.userId, id]
    );

    if (existingReaction.length > 0) {
      const existingType = existingReaction[0].reaction_type;

      if (existingType === reaction_type) {
        // If the same reaction is clicked, remove it (toggle off)
        await queryDB(`DELETE FROM ${tableName} WHERE id = $1`, [existingReaction[0].id]);
        res.status(200).json({ message: "Reaction removed!" });
        return;
      } else {
        // If different reaction, update it
        await queryDB(
          `UPDATE ${tableName} SET reaction_type = $1 WHERE id = $2`,
          [reaction_type, existingReaction[0].id]
        );
        res.status(200).json({ message: "Reaction updated!" });
        return;
      }
    } else {
      // **Add new reaction**
      await queryDB(
        `INSERT INTO ${tableName} (user_id, blog_id, reaction_type) VALUES ($1, $2, $3)`,
        [user.userId, id, reaction_type]
      );
      res.status(201).json({ message: "Reaction added!" });
      return;
    }
  } catch (error) {
    console.error("Error handling reaction:", error);
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }
};

export const fetchUserReaction = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const user = (req as any).user;

  try {
    const userReaction = await queryDB(
      `SELECT reaction_type FROM blog.reactions WHERE user_id = $1 AND blog_id = $2`,
      [user.userId, id]
    );

    if (userReaction.length > 0) {
      res.status(200).json({ reaction: userReaction[0].reaction_type });
    } else {
      res.status(200).json({ reaction: null });
    }
  } catch (error) {
    console.error("Error fetching user reaction:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const fetchCategoriesForUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const tableName = "blog.categories"

    const query = `
        SELECT DISTINCT c.id, c.name 
        FROM blog.categories c
        INNER JOIN blog.subcategories s ON c.id = s.category_id
    `;
    const response = await queryDB(query, []);

    if (response.length > 0) {
      res.status(201).json({ categories: response })
      return;
    }
  } catch (error) {
    res.status(500).json({ mesage: "internal server error" })
    return;
  }
};

export const filterCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const selectedCategories = req.query.q;
    const search = (req.query.search as string)?.trim().toLowerCase();

    if (!selectedCategories) {
      res.status(400).json({ message: "No categories selected" });
      return;
    }

    const selectedArray = Array.isArray(selectedCategories)
      ? selectedCategories
      : [selectedCategories];

    const allCategoriesQuery = "SELECT * FROM blog.categories";
    const allCategories = await queryDB(allCategoriesQuery, []);

    const matchedCategories = allCategories.filter((cat: { id: number, name: string }) =>
      selectedArray.includes(cat.name)
    );
    const categoryIds = matchedCategories.map((cat) => cat.id);

    if (categoryIds.length === 0) {
      res.status(404).json({ message: "No matching categories found" });
      return;
    }

    const subcategoriesQuery = `
      SELECT id FROM blog.subcategories WHERE category_id = ANY($1)
    `;
    const subcategoriesResult = await queryDB(subcategoriesQuery, [categoryIds]);
    const subcategoryIds = subcategoriesResult.map((sub: { id: number }) => sub.id);

    let blogsQuery = `
      SELECT * FROM blog.blogs
      WHERE subcategory_id = ANY($1)
    `;
    const queryParams: any[] = [subcategoryIds];

    if (search) {
      blogsQuery += `
        AND (LOWER(title) LIKE $2 OR LOWER(description) LIKE $2 OR LOWER(content) LIKE $2)
      `;
      queryParams.push(`%${search}%`);
    }

    const blogs = await queryDB(blogsQuery, queryParams);

    res.status(201).json({ selectedArray, categoryIds, subcategoryIds, blogs });
  } catch (error) {
    console.error("Error filtering categories:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const makeRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category_id, subcategory_id } = req.body
    const tableName = "blog.blog_requests"
    const user = (req as any).user

    if (!category_id || !subcategory_id) {
      res.status(400).json({ message: "Please select both category and subcategory!" })
      return;
    };

    const requestExists = await queryDB(`SELECT * FROM ${tableName} WHERE category_id = $1 AND subcategory_id = $2 AND user_id = $3 `, 
      [category_id, subcategory_id, user.userId]
    );

    if (requestExists.length > 0) {
      res.status(400).json({ message: "Already requested for this category or subcatgory" });
      return;
    };

    const query = `INSERT INTO ${tableName} (user_id, category_id, subcategory_id, status) VALUES($1, $2, $3, $4)`

    const resposne = await queryDB(query, [user.userId, Number(category_id), Number(subcategory_id), 'pending'])

    res.status(201).json({ message: "Request made successfully!" })
    return;
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const fetchRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const tableName = "blog.blog_requests"
    const user = (req as any).user

    const query = `SELECT * FROM ${tableName} WHERE user_id = $1`

    const response = await queryDB(query, [user.userId])

    if (response.length == 0) {
      res.status(400).json({ message: "no request made" });
      return;
    };

    const pendingRequest = response.filter(data => data["status"] === "pending")
    const accpetedRequest = response.filter(data => data["status"] === "accepted")
    const rejectedRequest = response.filter(data => data["status"] === "rejected")

    res.status(201).json({ pendingRequest, accpetedRequest, rejectedRequest })
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};

export const downloadBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const blogId = req.params.id;
    const result = await queryDB(
      'SELECT title, description, content FROM blog.blogs WHERE id = $1',
      [blogId]
    );

    if (!result || result.length === 0) {
      res.status(404).json({ message: 'Blog not found' });
      return;
    }

    const { title, description, content } = result[0];
    const safeTitle = title.replace(/[^a-z0-9_\-]/gi, '_').substring(0, 100);

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${title}</title>
          <style>
            /* Table-specific fixes */
            table {
              width: 100% !important;
              border-collapse: collapse !important;
              table-layout: fixed !important;
              word-wrap: break-word;
              page-break-inside: avoid;
            }
            th, td {
              border: 1px solid #ddd !important;
              padding: 8px !important;
              text-align: left !important;
              min-width: 50px !important; /* Ensure columns don't collapse */
            }
            th {
              background-color: #f2f2f2 !important;
            }
            
            /* Force visibility of all cells */
            td {
              display: table-cell !important;
              visibility: visible !important;
            }
            
            /* Prevent text overflow */
            td, th {
              overflow: visible !important;
              white-space: normal !important;
            }
            
            /* Your other existing styles... */
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${title}</h1>
            <div class="description">${description}</div>
          </div>
          ${content}
        </body>
      </html>
    `;

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    await page.setViewport({ width: 1200, height: 1123 });
    
    await page.setContent(html, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });

    // Additional table rendering assurance
    await page.evaluate(() => {
      document.querySelectorAll('table').forEach(table => {
        table.style.visibility = 'visible';
        table.style.display = 'table';
      });
    });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm', left: '10mm', right: '10mm' },
      preferCSSPageSize: false, 
      scale: 0.8 
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.end(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ 
      message: 'Failed to generate PDF',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};