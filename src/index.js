import dotenv from "dotenv"
import { app } from "./app.js"
import connect_DB from './db/DB_connect.js'
dotenv.config({ path: "./.env" })

// connect_DB();
const PORT = process.env.PORT || 3000

// dotenv.config({ path: "./.env" });

(async () => {
    try {
        await connect_DB();
        app.on("ERROR", (error) => {
            console.log(error);
        })
        app.listen(PORT, () => {
            console.log(`Server is running on port : ${PORT}`);
        });
    } catch (err) {
        console.log(`Error on Connecting!! ${err}`);
    }
})();




















/*

 import mongoose from "mongoose";
import express from "express";
const app = express();
import { DB_NAME } from "./constants"
    ; (async () => {
        try {
            await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
            app.on("ERROR", (error) => {
                console.log(`ERROR: ${error}`)
                throw error
            })
            app.listen(process.env.PORT, () => {
                console.log(`Runing....`)
            })
        } catch (error) {
            console.log(`ERROR: ${error}`)
        }
    })()
        */