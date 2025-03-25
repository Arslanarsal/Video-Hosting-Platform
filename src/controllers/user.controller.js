import { AsyncHandler } from '../utils/AsyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { userModel } from '../models/user.model.js'
import { uploadOnClordinary } from '../utils/cloudinary.js'
import { ApiResponce } from '../utils/ApiResponce.js'

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



export { registerUser }