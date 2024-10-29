import User from "../models/user.model.js";
import AppError from "../utils/error.util.js";
import cloudinary from "cloudinary";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto"
import fs from "fs"

const cookieOption = {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    secure: true,
};

const register = async (req, res, next) => {
    try {
        const { fullName, email, password } = req.body;
    
        if (!fullName || !email || !password) {
            return next(new AppError("All Field are required", 400));
        }
    
        const userExist = await User.findOne({ email });
    
        if (userExist) {
            return next(new AppError("User already exist", 400));
        }

        const role = req.body.role || "USER";
    
        const user = await User.create({
            fullName,
            email,
            password,
            role,
            avatar: {
                public_id: email,
                secure_url:
                    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
            },
        });
    
        if (!user) {
            return next(
                new AppError("User registration failed please try again !!!", 400)
            );
        }
    
        // TODO : File Upload
        if (req.file) {
            console.log(req.file);
            try {
                const result = cloudinary.v2.uploader.upload(req.file.path, {
                    folder: "lms",
                    width: 250,
                    height: 250,
                    gravity: "faces",
                    crop: "fill",
                });
    
                if (result) {
                    user.avatar.public_id = (await result).public_id;
                    user.avatar.secure_url = (await result).secure_url;
    
                    //  Remove file from server
    
                    fs.unlinkSync(req.file.path)
                }
            } catch (error) { 
                return next(new AppError(error || 'File not uploaded try again !!!',500))
            }
        }
    
        await user.save();
    
        user.password = undefined;
    
        const token = await user.generateJWTToken();
    
        res.cookie("token", token, cookieOption);

        if (user.role === "ADMIN") {
            res.status(201).json({
                success: true,
                message: "Admin registered successfully",
                user: user,
            });
            return;
        }

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: user,
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new AppError("all field are required", 400));
        }

        const user = await User.findOne({
            email,
        }).select("+password");

        if (!user || !user.comparePassword(password)) {
            return next(new AppError("email or password does not match", 400));
        }

        const token = await user.generateJWTToken();

        user.password = undefined;

        res.cookie("token", token, cookieOption);

        res.status(200).json({
            success: true,
            message: "user logged in successfully",
            user,
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

const logout = (req, res, next) => {
    try {
        res.cookie("token", null, {
            secure: true,
            maxAge: 0,
            httpOnly: true,
        });

        res.status(200).json({
            success: true,
            message: "user logout successfully",
        });
    } catch (error) {
        return next(new AppError(error.message, 400));
    }
};

const getProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        res.status(200).json({
            success: true,
            message: "user detail found",
            user
        });
    } catch (error) {
        return next(new AppError("Failed to fetch profile", 400));
    }
};


const forgotPassword=async (req,res,next) => {
    const {email}=req.body
    if (!email) {
        return next(new AppError("email is required",400))
    }

    const user=await User.findOne({email})

    if (!user) {
        return next(new AppError("Email doesn't exist",400))
    }

    const resetToken=await user.generatePasswordResetToken()
    await user.save()
    console.log('====================================');
    console.log(resetToken);
    console.log('====================================');
    const resetPasswordURL= `${process.env.FRONTEND_URL}/reset-password/${resetToken}`
    const message="Reset Password Link"
    const subject=`Reset Password Link <a>${resetPasswordURL}</a>`
    try {
        await sendEmail(email,subject,message)

        res.status(200).json({
            success: true,
            message: `Email sent successfully ${email}`,
            });
        
    } catch (error) {
        user.forgotPasswordToken=undefined
        user.forgotPasswordExpiry=undefined
        await user.save()
        return next(new AppError("Email sending failed",500))
    }
    
}

const resetPassword=async (req,res,next) => {
    const {resetToken}=req.params
    const {password}=req.body
    if (!password) {
        return next(new AppError("password is required",400))
        }
        const forgotPasswordToken=await crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')

    const user=await User.findOne({
        forgotPasswordToken,
        forgotPasswordExpiry: { $gt: Date.now() }
    })

    if (!user) {
        return next(new AppError("Invalid token or is expired",400))
        }
    
        user.password=password
        user.forgotPasswordToken=undefined
        user.forgotPasswordExpiry=undefined

        await user.save()

        res.status(200).json({
            success: true,
            message: `Password reset successfully`
            });
        
}

const changePassword=async (req,res,next) => {
    const {oldPassword,newPassword}=req.body

    if(!oldPassword || !newPassword){
        return next(new AppError("old password and new password are required",400))
    }

    const {id} =req.user
    const user=await User.findById(id)

    if(!user){
        return next(new AppError("User not found",404))
        }

    const isValid=await bcrypt.compare(oldPassword,user.password)
    if(!isValid){
        return next(new AppError("Invalid old password",400))
    }

    user.password=newPassword

    await user.save()

    user.password=undefined

    res.status(200).json({
        success: true,
        message: `Password changed successfully`
    })
    
}


const updateUser=async (req,res,next) => {
    const {fullName}=req.body
    const {id}=req.user
    const user=await User.findById(id)
    if(!user){
        return next(new AppError("User not found",404))
        }
    
        if (fullName) {
            user.fullName = fullName;
        }

        if (req.file) {
            await cloudinary.v2.uploader.destroy(
                user.avatar.public_id
            )

            try {
                const result = cloudinary.v2.uploader.upload(req.file.path, {
                    folder: "lms",
                    width: 250,
                    height: 250,
                    gravity: "faces",
                    crop: "fill",
                });
    
                if (result) {
                    user.avatar.public_id = (await result).public_id;
                    user.avatar.secure_url = (await result).secure_url;
    
                    //  Remove file from server
                    fs.unlinkSync(req.file.path)
                }
            } catch (error) { 
                return next(new AppError(error || 'File not uploaded try again !!!',500))
            }

        }

        await user.save()

        res.status(200).json({
            status: 'success',
            message:'User updated successfully',
            user
        })

}


export { register, login, logout, getProfile,forgotPassword,resetPassword,changePassword,updateUser };
