
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.model.js";

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5173/api/v1/user/google/callback"
},
async (accessToken, refreshToken, profile, cb) => {
    try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
            user = await User.create({
                googleId: profile.id,
                fullName: profile.displayName,
                email: profile.emails[0].value,
                avatar: {
                    public_id: profile.id,
                    secure_url: profile.photos[0].value
                }
            });
        }
        return cb(null, user);
    } catch (error) {
        return cb(error, null);
    }
}));

passport.serializeUser((user, cb) => {
    cb(null, user.id);
});

passport.deserializeUser(async (id, cb) => {
    try {
        const user = await User.findById(id);
        cb(null, user);
    } catch (error) {
        cb(error, null);
    }
});

export default passport;