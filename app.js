import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import userRoutes from "./routes/user.routes.js"
const app = express();

app.use(express.json());

app.use(cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true
}));

app.use(cookieParser());
app.use(morgan('dev'))

app.use('/ping', (req, res) => {
    res.send('/pong');
});

app.use("/api/v1/user",userRoutes)
// Routes of 3 modules
app.all('*', (req, res) => {
    res.status(404).send('OOPS! 404 Page Not Found');
});

export default app;
