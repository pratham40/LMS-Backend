import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import userRoutes from "./routes/user.routes.js"
import courseRoutes from "./routes/course.routes.js"
import paymentRoutes from "./routes/payment.routes.js"
import errorMiddleware from './middlewares/error.middleware.js';
import miscRoutes from "./routes/miscellaneous.routes.js"

const app = express();

app.use(express.json());    
app.use(express.urlencoded({
    extended: true
}))

const corsOption={
    origin:'http://localhost:5173',
    credentials:true,
    methods:['GET','POST','PUT','DELETE','OPTIONS']
}

app.use(cors(corsOption));

// Handle preflight requests
app.options('*', cors());

app.use(cookieParser());
app.use(morgan('dev'))

app.use('/ping', (req, res) => {
    res.send('/pong');
});


//user routes

app.use("/api/v1/user",userRoutes)


// course routes

app.use("/api/v1/courses",courseRoutes)


// payments routes

app.use("/api/v1/payments",paymentRoutes)


app.use("/api/v1/",miscRoutes)

app.all('*', (req, res) => {
    res.status(404).send('OOPS! 404 Page Not Found');
});

app.use(errorMiddleware)

export default app;
