import User from "../models/user.model.js"
import AppError from "../utils/error.util.js"
const cookieOption={
    maxAge:7*24*60*60*1000, // 7 days
    httpOnly:true,
    secure:true
}

const register=async(req,res,next)=>{

    const {fullName,email,password} = req.body

    if(!fullName || !email || !password){
        return next(new AppError('All Field are required',400))
    }

    const userExist = await User.findOne({email})

    if (userExist) {
        return next(new AppError('User already exist',400))
    }

    const user=await User.create({
        fullName,
        email,
        password,
        avatar:{
            public_id:email,
            secure_url:"https://images.pexels.com/photos/28209723/pexels-photo-28209723/free-photo-of-women-overlooking-city-at-night.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load"
        }
    })

    if (!user) {
        return next(new AppError('User registration failed please try again !!!',400))
    }

    // TODO : File Upload
    
    await user.save()

    user.password=undefined

    const token=await user.generateJWTToken()

    res.cookie('token',token,cookieOption)
    res.status(201).json({
        success:true,
        message:'User registered successfully'
    })
    
}

const login=async(req,res,next)=>{
    try {
        const {email,password} = req.body

    if (!email || !password) {
        return next(new AppError('all field are required',400))
    }

    const user=await User.findOne({
        email
    }).select('+password')

    if (!user || !user.comparePassword(password)) {
        return next(new AppError('email or password does not match',400))
    }

    const token=await user.generateJWTToken()

    user.password=undefined

    res.cookie('token',token,cookieOption)

    res.status(200).json({
        success:true,
        message:"user logged in successfully",
        user
    })
    } catch (error) {
        return next(new AppError(error.message,500))
    }
}

const logout=(req,res)=>{
    res.cookie('token',null,{
        secure:true,
        maxAge:0,
        httpOnly:true
    })

    res.status(200).json({
        success:true,
        message:"user logout successfully",
        user
    })
}

const getProfile=(req,res)=>{

}

export {
    register,login,logout,getProfile
}