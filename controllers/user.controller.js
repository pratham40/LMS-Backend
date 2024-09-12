import User from "../models/user.model"
import AppError from "../utils/error.util"
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

const login=(req,res)=>{

}

const logout=(req,res)=>{

}

const getProfile=(req,res)=>{

}

export {
    register,login,logout,getProfile
}