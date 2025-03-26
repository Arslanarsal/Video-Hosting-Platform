import { ApiError } from "../utils/ApiError.js";
import jwt from 'jsonwebtoken'
import { userModel } from "../models/user.model.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";

const verifyJWT = AsyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        // const token =  req.cookies
        console.log(req.cookies);
        // console.log(token);
        
        if (!token) {
            throw new ApiError(401, "Unauthorized Access")
        }

        const decodeToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await userModel.findById(decodeToken._id).select(
            "-password -refreshToken"
        )

        if (!user) {
            throw new ApiError(401, "Invalid access token")
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
})

export {verifyJWT}