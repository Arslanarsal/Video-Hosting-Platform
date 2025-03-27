import { AsyncHandler } from '../utils/AsyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { userModel } from '../models/user.model.js'
import { uploadOnClordinary } from '../utils/cloudinary.js'
import { ApiResponce } from '../utils/ApiResponce.js'
import jwt from 'jsonwebtoken'


const generateAccessAndRefreshToken = async function (userId) {
    try {
        const user = await userModel.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "Error on Generating Access and Refresh Token")
    }
}

const registerUser = AsyncHandler(async (req, res) => {
    const { username, email, fullName, password } = req.body;
    // console.log(username, email, fullName, password);

    if ([username, email, fullName, password].some((para) => para?.trim() === "")) {
        throw new ApiError(400, "All field are required");
    }

    const existedUser = await userModel.findOne({
        $or: [{ username }, { email }],
    })
    if (existedUser) {
        throw new ApiError(409, "User is Already Existed!!");
    }

    console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath = "";
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is Required!");
    }

    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }


    const avatarC = await uploadOnClordinary(avatarLocalPath);
    const coverImageC = coverImageLocalPath.length ? await uploadOnClordinary(coverImageLocalPath) : "";
    if (!avatarC) {
        throw new ApiError(400, "Error on Uploading Clordinary");
    }

    const user = await userModel.create({
        username: username.toLowerCase(),
        email,
        avatar: avatarC.url,
        coverImage: coverImageC?.url || "",
        fullName,
        password
    })

    const createdUser = await userModel.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Error while Creating User!")
    }

    return res.status(201).json(
        new ApiResponce(201, createdUser, "User Registered Successfully")
    );
})

const loginUser = AsyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    // console.log(username, email, password);

    if ((!username && !email)) {
        throw new ApiError(400, "Something is Missing email or password")
    }

    const user = await userModel.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(400, "Username Or email is inCorrect")
    }

    const isPasswordCorrect = user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        throw new ApiError(400, "password is inCorrect")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await userModel.findById(user._id).select(
        "-password -refreshToken"
    );
    // console.log(loggedInUser);

    const options = {
        httpOnly: true,
        secure: true,
    }

    res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponce(
                200,
                { refreshToken, accessToken, loggedInUser },
                "User loggedIn Successfully"
            )
        )
}
)

const logoutUser = AsyncHandler(async (req, res) => {
    await userModel.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }

    )

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponce(200, {}, "Logout Successfully")
        )

})


const refreshAccessToken = async function (req, res) {
    const inCommingRefreshToken = req.cookie.refreshToken || req.body.refreshToken;

    if (!inCommingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    const decodedToken = await jwt.verify(inCommingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await userModel.findById(decodedToken._id).select(
        "-password -refreshToken"
    );

    if (!user) {
        throw new ApiError(401, "Invalid refresh token")
    }

    if (user.refreshToken !== inCommingRefreshToken) {
        throw new ApiError(401, "Refresh token is expire or used")
    }


    const { accessToken, refreshToken } = generateAccessAndRefreshToken(decodedToken._id);

    const options = {
        httpOnly: true,
        secure: true
    }

    res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponce(200, {
                user, refreshToken, accessToken
            },
                "Generate new access token successfully!"
            )
        )
}

export { registerUser, loginUser, logoutUser, refreshAccessToken }