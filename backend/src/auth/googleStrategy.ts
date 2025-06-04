import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import { queryDB } from "../config/db";

dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: `${process.env.GOOGLE_CALLBACK_URL}/callback`,
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails?.[0].value;
        const username = profile.displayName;

        const userQuery = await queryDB(
            "SELECT * FROM blog.users WHERE email = $1", 
            [email]
        );

        let user;
        if (userQuery.length === 0) {
            const insert = await queryDB(
                `INSERT INTO blog.users (username, email, password, role, login_method) 
                 VALUES ($1, $2, '', 'user', 'google') RETURNING *`,
                [username, email]
            );
            user = insert[0];
        } else {
            user = userQuery[0];
        }

        return done(null, user);
    } catch (err) {
        return done(err as Error);
    }
}));
