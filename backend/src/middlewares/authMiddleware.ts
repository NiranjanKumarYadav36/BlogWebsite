import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend the Express Request type to include 'user'
interface AuthRequest extends Request {
    user?: any;
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        res.status(401).json({ success: false, message: "Access denied. No token provided." });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number, role: string, username: string, email: string};
        (req as any).user = { userId: decoded.userId, role: decoded.role, username: decoded.username, email: decoded.email};
        next();
    } catch (error) {
        res.status(403).json({ success: false, message: "Invalid token." });
    }
};