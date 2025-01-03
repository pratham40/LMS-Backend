import { config as configDotenv } from 'dotenv';
import app from './app.js';
import connectionToDB from './config/dbConnection.js';
import cloudinary from "cloudinary"
import Razorpay from "razorpay"
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import session from "express-session"
import passport from 'passport';
configDotenv();

const PORT = process.env.PORT;

cloudinary.v2.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})


export const razorpay= new Razorpay({
    key_id:process.env.RAZORPAY_KEY_ID,
    key_secret:process.env.RAZORPAY_SECRET
})

app.use((req,res,next)=>{
    res.header("Cross-Origin-Embedder-Policy","same-origin")
    res.header("Cross-Origin-Opener-Policy","require-corp")
    next()
})

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

app.use(session({
    secret:"This is a secret",
    resave:false,
    saveUninitialized:false
}))

app.use(passport.initialize())
app.use(passport.session())

app.listen(PORT, async() => {
    await connectionToDB();
    console.log(`Server is listening on http://localhost:${PORT}`);
});
