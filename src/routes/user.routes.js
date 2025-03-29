import { Router } from "express";
import {
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
} from "../controllers/user.controller.js"
import { upload } from '../middlewares/multer.middleware.js'
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)
router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-Password").post(verifyJWT, changePassword)
router.route("/get-User").post(verifyJWT, getCurrentUser)
router.route("/update-Account").patch(verifyJWT, updateAccountDetail)
router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateAvatar)
router.route("/update-CoverImage").get(verifyJWT, upload.single("coverImage"), updateCoverImage)
router.route("/UserProfile/:username").get(verifyJWT, getUserChannelProfile)
router.route("/watch-History").get(verifyJWT, watchHistory)

export default router 