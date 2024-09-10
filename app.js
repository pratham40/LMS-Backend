const cookieParser=require("cookie-parser")

const express =  require("express")
const cors = require("cors")
const app = express()
app.use(express.json())
app.use(cors({
    origin:[process.env.FRONTEND_URL],
    credentials:true
}))

app.use(cookieParser())

app.use('/ping',(req,res)=>{
    res.send("/pong")
})

// Routes of 3 modules
app.all("*",(req,res)=>{
    res.status(400).send('OOPS! 404 Page Not Found')
})


module.exports=app