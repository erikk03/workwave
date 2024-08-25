'use server'

import Post from "@/models/post";
import { revalidatePath } from "next/cache";
import Notification from "@/models/notification";

export default async function createCommentAction(postId, formData, session) {
    const user = session?.user;
    const commentInput = formData.get("commentInput").toString();

    if (!postId) {
        throw new Error("Post ID is required");
    }
    if (!commentInput) {
        throw new Error("Comment input is required");
    }
    if (!user?.userId) {
        throw new Error("User not authenticated");
    }

    const userDB = {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        userImage: user.profileImage || "",
    };

    const post = await Post.findById(postId);

    if (!post) {
        throw new Error("Post not found");
    }

    const comment = {
        user: userDB,
        text: commentInput,
    };

    const notification = {
        type: "comment",
        userId: user.userId,
        userFirstName: user.firstName,
        userLastName: user.lastName,
        comment: commentInput,
        postId: postId,
        createdAt: new Date(),
    }
    console.log("notification", notification);

    try {
        await post.commentOnPost(comment);

      
        await post.addCommentNotification(notification);
        
        await post.save();
        revalidatePath('/');
    } catch (error) {
        console.error("Error creating comment:", error);
        throw new Error("Error creating comment");
    }
}


