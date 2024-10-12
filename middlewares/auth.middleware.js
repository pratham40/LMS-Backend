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

const authorizedRoles=(...roles)=>async (req,res,next) => {
    if (!roles.includes(req.user.role)) {
        return next(new AppError(`User role is not authorized to access this route`,403))
    }
    next()
}

export  {
    isLoggedIn,
    authorizedRoles
}