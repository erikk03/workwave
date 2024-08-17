import mongoose, {Schema, models} from "mongoose";

const CommentSchema = new Schema({
    user: {
        userId: {type: String, required: true },
        firstName: {type: String, required: true },
        lastName: {type: String, required: true },
        userImage: {type: String },
    },
    text: {type: String, required: true },
    },
    {
        timestamps:true,
    }
);

export const Comment = models.Comment || mongoose.model("Comment", CommentSchema);