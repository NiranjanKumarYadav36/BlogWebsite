import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

const router = express.Router();

// Redirect to Google
router.get("/google", passport.authenticate("google", {
    scope: ["profile", "email"]
}));

// Google OAuth callback
router.get("/google/callback",
    passport.authenticate("google", { 
        session: false,
        failureRedirect: `${process.env.FRONTEND_URL}/login`
    }),
    (req, res) => {
        const user = req.user as any;
        const token = jwt.sign(
            { 
                userId: user.id, 
                username: user.username, 
                role: user.role, 
                email: user.email 
            }, 
            process.env.JWT_SECRET as string, 
            { expiresIn: "1h" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: true, // Enable in production
            sameSite: "none",
            maxAge: 3600000
        });

        res.redirect(process.env.CLIENT_URL as string);
    }
);

export default router;