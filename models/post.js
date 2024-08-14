import mongoose from "mongoose";
// import Comment from "./comment"; // Uncomment if you need to use comments

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
        imageUrl: { type: String },
        // comments: { type: [Schema.Types.ObjectId], ref: "Comment", default: [] },
        // likes: { type: [String] },
    },
    {
        timestamps: true,
    }
);

// Instance Methods (Uncomment and implement if needed)

// PostSchema.methods.likePost = async function (userId) {
//     try {
//         await this.updateOne({ $addToSet: { likes: userId } });
//     } catch (error) {
//         console.log("error when liking post", error);
//     }
// };

// PostSchema.methods.unlikePost = async function (userId) {
//     try {
//         await this.updateOne({ $pull: { likes: userId } });
//     } catch (error) {
//         console.log("error when unliking post", error);
//     }
// };

// PostSchema.methods.removePost = async function () {
//     try {
//         await this.model("Post").deleteOne({ _id: this._id });
//     } catch (error) {
//         console.log("error when removing post", error);
//     }
// };

// PostSchema.methods.commentOnPost = async function (commentToAdd) {
//     try {
//         const comment = await Comment.create(commentToAdd);
//         this.comments.push(comment._id);
//         await this.save();
//     } catch (error) {
//         console.log("error when commenting on post", error);
//     }
// };

// PostSchema.methods.getAllComments = async function () {
//     try {
//         await this.populate({
//             path: "comments",
//             options: { sort: { createdAt: -1 } },
//         });
//         return this.comments;
//     } catch (error) {
//         console.log("error when getting all comments", error);
//     }
// };

// Static Methods

PostSchema.statics.getAllPosts = async function () {
    try {
        const posts = await this.find()
            .sort({ createdAt: -1 })
            .populate({
                path: "comments",
                options: { sort: { createdAt: -1 } },
            })
            .lean(); // Convert Mongoose documents to plain JS objects

        return posts.map((post) => ({
            ...post,
            _id: post._id.toString(),
            // Uncomment if you need to handle comments
            // comments: post.comments?.map((comment) => ({
            //     ...comment,
            //     _id: comment._id.toString(),
            // })),
        }));
    } catch (error) {
        console.log("error when getting all posts", error);
    }
};

const Post = models.Post || model("Post", PostSchema);

export default Post;
