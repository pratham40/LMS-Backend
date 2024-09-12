import { model, Schema } from "mongoose";

const userSchema=new Schema({
    fullName:{
        type:String,
        required:[true,'Name is required'],
        minLength:[5,"Name must be atleast 5 character"],
        maxLength:[15,"Name must be atmost 15 character"],
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
        required:[true,'password is required'],
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
    forgotPasswordExpiry:Date
} , {timestamps:true})
const User =model('User',userSchema)

export default User