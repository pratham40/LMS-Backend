import {Router} from "express"
import { changePassword, forgotPassword, getProfile, login, logout, register, resetPassword, updateUser } from "../controllers/user.controller.js"
import { isLoggedIn } from "../middlewares/auth.middleware.js"
import upload from "../middlewares/multer.middleware.js"
import passport from "passport"

const router=Router()

router.post("/register",upload.single("avatar"),register)

router.post("/login",login)

router.get("/google",passport.authenticate("google",{scope:["profile","email"]}))

router.get("/google/callback",passport.authenticate("google",{
    failureRedirect:"/login"},
    (req,res)=>{
        res.redirect("http://localhost:5173/")
    }))

router.get("/logout",logout)

router.get("/me",isLoggedIn,getProfile)

router.post("/reset",forgotPassword)

router.post("/reset/:resetToken",resetPassword)

router.post("/changePassword",isLoggedIn,changePassword)

router.put("/update/:id",isLoggedIn,upload.single("avatar"),updateUser)

export default router