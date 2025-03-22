import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';
const app = express();


app.use(cors({
    origin: process.env.CROS_ORIGIN || "*"
}))
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({
    limit: "16kb",
    extended: true
}))
app.use(express.static("Public"))
app.use(cookieParser());


//import Route
import router from './routes/user.routes.js';

//Router declaration
app.use("/api/v1/user", router);
//http://localhost:3000/api/v1/user/register

export { app };