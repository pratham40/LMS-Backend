import { config as configDotenv } from 'dotenv';
import app from './app.js';
import connectionToDB from './config/dbConnection.js';
import cloudinary from "cloudinary"
import Razorpay from "razorpay"
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

app.listen(PORT, async() => {
    await connectionToDB();
    console.log(`Server is listening on http://localhost:${PORT}`);
});
