import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";

const userScheme = new Schema({
    username: {
        type: String,
        require: true,
        lowercase: true,
        unique: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        unique: true,
        require: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        require: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String, // Cloudinary url
        require: true
    },
    coverImage: {
        type: String
    },
    password: {
        type: String,
        require: [true, "Password is Required"],
    },
    refreshToken: {
        type: String
    },
    watchHistory: [
        {
            type: mongoose.Schema.type.ObjectId,
            ref: "video"
        }
    ],
}, { timestamps: true })

userScheme.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = bcrypt.hash(this.password, 10);
    return next();
})

userScheme.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}

userScheme.methods.generateAccessToken = async function () {
   return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName,
    },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }

    )
}

userScheme.methods.generateRefreshToken = async function () {
   return jwt.sign({
        _id: this._id,
    },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }

    )
}

export const userModel = mongoose.model("user", userScheme);