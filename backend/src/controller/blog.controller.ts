import { queryDB } from "../config/db";
import { Response, Request, query } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "dotenv";
import { randomInt } from "crypto";
import nodemailer from "nodemailer";

config();

// Temporary in-memory storage (use Redis for production)
const otpStorage = new Map<string, { otp: string; expiresAt: number }>();

const generateOTP = (): string => {
    return Array.from({ length: 6 }, () => randomInt(0, 9)).join('');
};

export const sendRegistrationOTP = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        if (!email) {
            res.status(400).json({ success: false, message: "Email is required" });
            return;
        }

        // Check if email already exists
        const existingUser = await queryDB(
            `SELECT email FROM blog.users WHERE email = $1`,
            [email]
        );

        if (existingUser.length > 0) {
            res.status(400).json({ success: false, message: "Email already registered" });
            return;
        }

        const otp = generateOTP();
        // Store OTP with expiry time (5 minutes)
        otpStorage.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

        // Send OTP via Email
        await sendRegisterOTPEmail(email, otp);
        res.status(200).json({ success: true, message: "OTP sent successfully" });
    } catch (error) {
        console.error("Error in sendRegistrationOTP:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
};

export const registerAccount = async (req: Request, res: Response): Promise<void> => {
    try {
        const tableName = "blog.users";
        const { username, email, password, otp } = req.body;

        if (!username || !email || !password || !otp) {
            res.status(400).json({ success: false, message: "Please enter all details" });
            return;
        }

        if (password.length < 6) {
            res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
            return;
        }

        // Check OTP
        const storedOTP = otpStorage.get(email);
        if (!storedOTP || storedOTP.otp !== otp) {
            res.status(400).json({ success: false, message: "Invalid OTP" });
            return;
        }

        if (Date.now() > storedOTP.expiresAt) {
            res.status(400).json({ success: false, message: "OTP has expired" });
            return;
        }

        // Check if username is taken
        const existingUser = await queryDB(
            `SELECT username FROM ${tableName} WHERE username = $1`,
            [username]
        );

        if (existingUser.length > 0) {
            res.status(400).json({ success: false, message: "Username already taken" });
            return;
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Insert the new user into the database
        const result = await queryDB(
            `INSERT INTO ${tableName} (username, email, password, role, login_method) VALUES ($1, $2, $3, $4, $5)`,
            [username, email, hashedPassword, 'user', 'normal']
        );

        // Clear OTP after successful registration
        otpStorage.delete(email);

        if (result) {
            res.status(201).json({ success: true, message: "Registered successfully" });
        } else {
            res.status(500).json({ success: false, message: "Registration failed" });
        }
    } catch (error) {
        console.error("Error in verifyOTPAndRegister:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
};

export const loginHandle = async (req: Request, res: Response): Promise<void> => {
    try {
        const tableName = "blog.users";
        const { username, password } = req.body;

        if (!username || !password) {
            res.status(400).json({ success: false, message: "Please enter all details" });
            return;
        }

        // Check if user exists
        const validUser = await queryDB(
            `SELECT id, username, password, role, email, login_method FROM ${tableName} WHERE username = $1`,
            [username]
        );

        if (validUser.length === 0) {
            res.status(401).json({ success: false, message: "Invalid username or password" });
            return;
        }

        const user = validUser[0];

        if (user["login_method"] === "google") {
            res.status(401).json({
                success: false,
                message: "Hello! It looks like you signed up using Google. Please continue logging in with your Google account."
            });
            return;
        }


        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ success: false, message: "Invalid username or password" });
            return;
        }

        // Generate JWT Token
        const token = jwt.sign(
            { userId: user.id, username: user.username, role: user.role, email: user.email },
            process.env.JWT_SECRET as string,
            { expiresIn: "1h" }
        );

        // Store JWT in HttpOnly Cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: true, // Secure in production
            sameSite: "none", // Needed for cross-site cookies
            maxAge: 3600000,
        });

        res.status(200).json({ success: true, message: "Login successful", token: token, user: user.role });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const logoutHandle = async (req: Request, res: Response): Promise<void> => {
    try {
        res.clearCookie("token"), {
            path: "/",
            httpOnly: true,
            sameSite: "Lax"
        }

        res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        res.status(404).json({ sucess: false, message: error })
    }
};

export const latestBlogForHomePage = async (req: Request, res: Response): Promise<void> => {
    try {
        const tableName = "blog.blogs"
        const query = `SELECT * FROM  ${tableName} ORDER BY updated_at DESC LIMIT 3`

        const response = await queryDB(query, [])

        res.status(201).json({ response })
    } catch (error) {
        res.status(500).json({ message: "server erroor" })
    }
};

export const passwordChange = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ message: "Email is required" });
            return;
        }

        const emailExists = await queryDB("SELECT id FROM blog.users WHERE email = $1", [email]);

        if (emailExists.length === 0) {
            res.status(404).json({ message: "Email not found" }); // Changed to 404 for not found
            return;
        }

        const googleUsers = await queryDB(
            `SELECT login_method FROM blog.users WHERE email = $1`,
            [email]
        );

        if (googleUsers[0]["login_method"] === "google") {
            res.status(403).json({
                message: "Please use Google login to access your account"
            });
            return;
        }

        const otp = generateOTP();

        // Store OTP with expiry time (5 minutes)
        otpStorage.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

        // Send OTP via Email
        await sendOTPEmail(email, otp);

        res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        console.error("Error generating OTP:", error);
        res.status(500).json({ message: "Error generating OTP" });
    }
};

export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            res.status(400).json({ message: "Email and OTP are required" });
            return;
        }

        const storedOtpData = otpStorage.get(email);

        if (!storedOtpData) {
            res.status(400).json({ message: "OTP not found or expired" });
            return;
        }

        const { otp: storedOtp, expiresAt } = storedOtpData;

        if (Date.now() > expiresAt) {
            otpStorage.delete(email);
            res.status(400).json({ message: "OTP has expired" });
            return;
        }

        if (otp !== storedOtp) {
            res.status(400).json({ message: "Invalid OTP" });
            return;
        }

        otpStorage.delete(email);

        res.status(200).json({ message: "OTP verified successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error verifying OTP" });
    }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            res.status(400).json({ message: "Email and new password are required" });
            return;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await queryDB(
            `UPDATE blog.users SET password = $1 WHERE email = $2`,
            [hashedPassword, email]
        )
        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error resetting password" });
    }
};


// Function to send OTP via email
const sendOTPEmail = async (email: string, otp: string) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER, // Your Gmail
            pass: process.env.EMAIL_PASSWORD, // App password (not personal password)
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Password Reset OTP",
        text: `Your OTP for password reset is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);
};

const sendRegisterOTPEmail = async (email: string, otp: string) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER, // Your Gmail
            pass: process.env.EMAIL_PASSWORD, // App password (not personal password)
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Regsitration OTP",
        text: `Your OTP for email verification is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);
};

export const newsletterSubscription = async (req: Request, res: Response) => {
    try {
        const tableName = "blog.newsletterusers";

        const { email } = req.body

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            res.status(400).json({ message: "Please provide a valid email address" });
            return;
        }

        const emailExists = await queryDB(`SELECT email FROM ${tableName} WHERE email = $1`, [email])


        if (emailExists.length > 0) {
            res.status(400).json({ message: "Already Subscribed!" })
            return;
        }


        await queryDB(`INSERT INTO ${tableName} (email) VALUES($1)`, [email])

        await sendWelcomeEmail(email);

        res.status(201).json({
            message: "Subscribed successfully! Check your email for confirmation."
        });
        return;
    } catch (error) {
        res.status(500).json({ error: "internal server error" })
    }
};

const sendWelcomeEmail = async (email: string) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const unsubscribeUrl = `${process.env.FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(email)}`;

        const mailOptions = {
            from: `"MyBlog" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Welcome to Our Newsletter!",
            html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1E40AF;">Thank You for Subscribing!</h2>
            <p>You've successfully subscribed to our newsletter. Here's what you can expect:</p>
            <ul>
              <li>New blog updates</li>
            </ul>
            <p>If you didn't request this subscription, you can <a href="${unsubscribeUrl}" style="color: red;">unsubscribe here</a>.</p>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
              <p>Best regards,</p>
              <p>The Blog Team</p>
            </div>
          </div>
        `,
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending welcome email:", error);
    }
};

export const newsletterUnSubscribe = async (req: Request, res: Response) => {
    try {
        const { email } = req.query;

        if (!email) {
            res.status(400).json({ message: "Email is required" });
            return;
        }



        await queryDB("DELETE FROM blog.newsletterusers WHERE email = $1", [email])

        res.status(201).json({ message: "You have been unsubscribed successfully." })

    } catch (error) {
        console.error("Error unsubscribing:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};