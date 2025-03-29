import { AsyncHandler } from '../utils/AsyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { userModel } from '../models/user.model.js'
import { uploadOnClordinary } from '../utils/cloudinary.js'
import { ApiResponce } from '../utils/ApiResponce.js'
import jwt from 'jsonwebtoken'
import mongoose, { set } from 'mongoose'


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
                refreshToken: null
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

const refreshAccessToken = AsyncHandler(async function (req, res) {
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
})

const changePassword = AsyncHandler(async function (req, res) {
    const { oldPassword, newPassword } = req.body;

    const user = await userModel.findById(req.user?._id)

    if (!user) {
        throw new ApiError(404, "User Not Found")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(401, "User Not Found")
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false })

    res.status(200).json(
        new ApiResponce(200, {}, "Password is Changed!")
    )
})

const getCurrentUser = AsyncHandler(async function (req, res) {
    res.status(200)
        .json(
            ApiResponce(200, req.user, "Successfully giving User")
        )
})

const updateAccountDetail = AsyncHandler(async function (req, res) {
    const { fullName, username } = req.body

    const user = await userModel.findById(req.user?._id);

    if (!user) {
        throw new ApiError(404, "User Not ound");
    }

    const updatedUser = await userModel.findByIdAndUpdate(
        user._id,
        {
            $set: {
                fullName,
                username,
            }
        },
        {
            new: true
        }
    ).select("-password")

    res.status(200).json(
        new ApiResponce(200, updatedUser, "Account details updated successfully")
    )

})

const updateAvatar = AsyncHandler(async function (req, res) {
    const LocalFilePath = req.file?.path;
    if (!LocalFilePath) {
        throw new ApiError(401, "File Not found")
    }

    const updateAvatar = await uploadOnClordinary(LocalFilePath)
    if (!updateAvatar.url) {
        throw new ApiError(401, "Error on cloudinary")
    }

    const updateUser = await userModel.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar: updateAvatar.url
            }
        },
        {
            new: true
        }
    ).select("-password")

    res.status(200).json(
        ApiResponce(200, updateUser, "Avatar Changed")
    )

})

const updateCoverImage = AsyncHandler(async function (req, res) {
    const LocalFilePath = req.file?.path;
    if (!LocalFilePath) {
        throw new ApiError(401, "File Not found")
    }

    const updateCoverImage = await uploadOnClordinary(LocalFilePath)
    if (!updateCoverImage.url) {
        throw new ApiError(401, "Error on cloudinary")
    }
    const updateUser = await userModel.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                coverImage: updateCoverImage.url
            }
        },
        {
            new: true
        }
    ).select("-password")

    res.status(200).json(
        ApiResponce(200, updateUser, "Avatar Changed")
    )

})

const getUserChannelProfile = AsyncHandler(async function (req, res) {

    const { username } = req.params;

    if (!username) {
        throw new ApiError(400, "Username Not Found");
    }
    username = username.trim();

    const channel = await userModel.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        }, {
            $lookup: {
                from: "subscription",
                localfield: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        }, {
            $lookup: {
                from: "subscription",
                localfield: "_id",
                foreignField: "subscriber",
                as: "subscriberTo"
            }
        }, {
            $addFields: {
                subscribeCount: {
                    $size: "$subscribers"
                },
                channelSubscribeCount: {
                    $size: "$subscriberTo"
                },
                isSubscibed: {
                    $cond: {
                        if: { $in: [req.user?._id, "subscribers.subscriber "] },
                        then: true,
                        else: false
                    }
                }
            }
        }, {
            $project: {
                username: 1,
                subscribers: 1,
                subscriberTo: 1,
                subscribeCount: 1,
                channelSubscribeCount: 1,
                isSubscibed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
                fullName: 1
            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError(401, "Channel does not Exit!");
    }

    res.status(200)
        .json(
            new ApiResponce(200, channel[0], "User channel fetch successfully")
        )
})

const watchHistory = AsyncHandler(async function (req, res) {
  const user =   await userModel.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        }, {
            $lookup: {
                from: "video",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "user",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    }, {

                    },{
                        $addFields:{
                            owner :{
                                $first : "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    res.status(200)
    .json(
        new ApiResponce(200 ,user[0].watchHistory ,"Watch History")
    )
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateAccountDetail,
    updateAvatar,
    updateCoverImage,
    getUserChannelProfile,
    watchHistory
}