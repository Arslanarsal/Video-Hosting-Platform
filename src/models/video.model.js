import mongoose, { Schema } from "mongoose";

import aggregatePaginate from "mongoose-aggregate-paginate-v2";


const videoScheme = new Schema({
    videoFile: {
        type: String, //url
        require: true
    },
    thumbnail: {
        type: String,  //url
        require: true,
    },
    title: {
        type: String,
        require: true,

    },
    description: {
        type: String,
        require: true,
    },
    duration: {
        type: Number,
        require: true,
        default: 0,
    },
    views: {
        type: Number,
        default: 0,
    },
    isPublished: {
        type: Boolean,
        default: true,

    },
    owner: {
        type: Schema.type.ObjectId,
        ref: "user",
    }
}, { timestamps: true })

videoScheme.plugin(aggregatePaginate);


export const videoModel = mongoose.model("video", videoScheme);