import mongoose from "mongoose";
import {Comment} from "./comment";
import {Notification} from "./notification";

const { Schema, model, models } = mongoose;

const PostSchema = new Schema(
    {
        user: {
            userId: { type: String, required: true },
            firstName: { type: String, required: true },
            lastName: { type: String, required: true },
            email: { type: String, required: true },
            userImage: { type: String },
        },
        text: { type: String, required: true },
        mediaUrl: { type: String },
        mediaType: { type: String },
        comments: { type: [Schema.Types.ObjectId], ref: "Comment", default: [] },
        likes: { type: [String] },
        notifications: { type: [Schema.Types.ObjectId], ref: "Notification", default: [] },
    },
    {
        timestamps: true,
    }
);

// Instance Methods

PostSchema.methods.likePost = async function (userId) {
    try {
        await this.updateOne({ $addToSet: { likes: userId } });
    } catch (error) {
        console.log("error when liking post", error);
    }
};

PostSchema.methods.unlikePost = async function (userId) {
    try {
        await this.updateOne({ $pull: { likes: userId } });
    } catch (error) {
        console.log("error when unliking post", error);
    }
};

PostSchema.methods.removePost = async function () {
    try {
        console.log("Removing post with id", this._id);
        await this.model("Post").deleteOne({ _id: this._id });
    } catch (error) {
        console.log("error when removing post", error);
    }
};


PostSchema.methods.commentOnPost = async function (commentToAdd) {
    try {
        const comment = await Comment.create(commentToAdd);
        this.comments.push(comment._id);
        await this.save();
    } catch (error) {
        console.log("error when commenting on post", error);
    }
};

PostSchema.methods.addCommentNotification = async function (notificationToAdd) {
    try {
        const notification = await Notification.create(notificationToAdd);
    
        // Push the notification's ObjectId into the post's notifications array
        this.notifications.push(notification._id);
    
        await this.save();  
        
    } catch (error) {
        console.log("error when sending comment notification", error);
    }
}

PostSchema.methods.addLikeNotification = async function (notificationToAdd) {
    try {
        const notification = await Notification.create(notificationToAdd);
    
        // Push the notification's ObjectId into the post's notifications array
        this.notifications.push(notification._id);
    
        await this.save();  
        
    } catch (error) {
        console.log("error when sending like notification", error);
    }
}

PostSchema.methods.getAllComments = async function () {
    try {
        await this.populate({
            path: "comments",
            options: { sort: { createdAt: -1 } },
        });
        return this.comments;
    } catch (error) {
        console.log("error when getting all comments", error);
    }
};

// Static Methods

PostSchema.statics.getAllPosts = async function () {
    try {
        const posts = await this.find()
        .sort({ createdAt: -1 })
        .populate({
            path: "comments",
            options: { sort: { createdAt: -1 } },
        })
        .lean();

        return posts.map((post) => ({
            ...post,
            _id: post._id.toString(),
            comments: post.comments?.map((comment) => ({
                ...comment,
                _id: comment._id.toString(),
            })) || [], // Return an empty array if comments is undefined
        }));

    } catch (error) {
        console.log("error when getting all posts", error);
        console.error('Error fetching posts:', error);
        throw error;
    }
};

const Post = models.Post || model("Post", PostSchema);

export default Post;
