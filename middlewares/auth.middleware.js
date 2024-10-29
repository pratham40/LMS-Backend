import jwt from "jsonwebtoken"
import AppError from "../utils/error.util.js"
import User from "../models/user.model.js"

const isLoggedIn = async (req, res, next) => {
    const { token } = req.cookies
    if (!token) {
        return next(new AppError('unauthenticated user please login', 401))
    }
    const userDetail = await jwt.verify(token, process.env.JWT_SECRET)

    req.user = userDetail

    next()
}

const authorizedRoles = (...roles) => async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return next(new AppError(`User role is not authorized to access this route`, 403))
    }
    next()
}

const authorizedSubscriber = async (req, res, next) => {
    const user = await User.findById(req.user.id)
    if (user.role !== "ADMIN" && user.subscription.status !== "active") {
        return next(new AppError("Please subscribe to access this route.", 403));
    }
    next()
}

export {
    isLoggedIn,
    authorizedRoles,
    authorizedSubscriber
}