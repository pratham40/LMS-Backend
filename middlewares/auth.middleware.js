import jwt from "jsonwebtoken"
import AppError from "../utils/error.util.js"

const isLoggedIn=async(req,res,next)=>{
    const { token }=req.cookies
    if (!token) {
        return next(new AppError('unauthenticated user please login',401))
    }
    const userDetail=await jwt.verify(token,process.env.JWT_SECRET)

    req.user=userDetail

    next()
}

export  {
    isLoggedIn
}