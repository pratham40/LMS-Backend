import { model, Schema } from "mongoose";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import crypto from "crypto"
import { log } from "console";
const userSchema=new Schema({
    fullName:{
        type:String,
        required:[true,'Name is required'],
        lowercase:true,
        trim:true,

    },
    email:{
        type:String,
        required:[true,'Email is required'],
        unique:true,
        lowercase:true,
        trim:true,
        match:[
            /^(?:(?:[\w`~!#$%^&*\-=+;:{}'|,?\/]+(?:(?:\.(?:"(?:\\?[\w`~!#$%^&*\-=+;:{}'|,?\/\.()<>\[\] @]|\\"|\\\\)*"|[\w`~!#$%^&*\-=+;:{}'|,?\/]+))*\.[\w`~!#$%^&*\-=+;:{}'|,?\/]+)?)|(?:"(?:\\?[\w`~!#$%^&*\-=+;:{}'|,?\/\.()<>\[\] @]|\\"|\\\\)+"))@(?:[a-zA-Z\d\-]+(?:\.[a-zA-Z\d\-]+)*|\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\])$/gm,
            "please enter valid email"
        ]
    },
    password:{
        type:String,
        minLength:[5,"password must be atleast 5 character"],
        select:false
    },
    avatar:{
        public_id:{
            type:String,

        },
        secure_url:{
            type:String,

        }
    },
    role:{
        type:String,
        enum:['USER','ADMIN'],
        default:'USER'
    },
    forgotPasswordToken:String,
    forgotPasswordExpiry:Date,
    subscription:{
        id:String,
        status:String,
    },
    googleId:{
        type:String,
        unique:true
    }
} , {timestamps:true})


userSchema.pre('save',async function (next) {
    if (!this.isModified('password')) {
        return next()
    }
    this.password=await bcrypt.hash(this.password,10)
})

userSchema.methods={
    generateJWTToken:async function () {
        return await jwt.sign(
            {
                id:this._id,
                email:this._email,
                subscription:this.subscription,
                role:this.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn:process.env.JWT_EXPIRY
            }
        )
    },
    comparePassword:async function (plainTextPassword) {
        return await bcrypt.compare(plainTextPassword,this.password)
    },
    generatePasswordResetToken:async function () {
        const resetToken = crypto.randomBytes(20).toString('hex');
        this.forgotPasswordToken=crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')

        this.forgotPasswordExpiry=Date.now()+15*60*1000 // 15 min from now

        return resetToken
    }
}

userSchema.methods.generateJWTTokenGoogle = async function () {
    const token = jwt.sign(
        {
            id: this._id,
            email: this.email,
            role: this.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRY
        }
    );
    console.log('====================================');
    console.log(token);
    console.log('====================================');
    return token;
}

const User =model('User',userSchema)

export default User