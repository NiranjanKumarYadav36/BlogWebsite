import express, { NextFunction, Request, response, Response } from "express";
import cors from "cors";
import { config } from "dotenv";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { connectDB, queryDB } from "./config/db";
import blogRoutes from "./routes/blog.router";
import path from "path";
import passport from "passport";
import "./auth/googleStrategy";
import authRoutes from "./routes/auth";

config();

const app = express();
const port = process.env.PORT || 5001;

app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));
app.use(
    cors({
      origin: process.env.FRONTEND_URL,
      credentials: true,
      exposedHeaders: ['Content-Disposition'],
    })
);
app.use(cookieParser());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));


app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error("Global Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
});
app.use(passport.initialize());

app.use("/api/auth", authRoutes);
app.use("/blog", blogRoutes)


process.on("uncaughtException", (err: Error) => {
    console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
    console.error(err.name, err.message);
    process.exit(1);
});

process.on("unhandledRejection", (err: Error) => {
    console.error("Unhandled Rejection! 💥 Shutting down...");
    console.error(err.name, err.message);
    process.exit(1);
});

// Start the server and listen on the specified port
const startServer = async () => {
    await connectDB();
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
};

startServer();