import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connect_DB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

        console.log(`\n Database connected !!! ${connectionInstance}`)
    } catch (error) {
        console.log(`ERROR On Connecting Database ${error}`)
    }
}

export default connect_DB;