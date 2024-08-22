// 'use server'

// // import { AddCommentRequestBody } from "@/app/api/posts/[post_id]/comments/route";
// import Post from "@/models/post";
// import { revalidatePath } from "next/cache";

// export default async function createCommentAction(postId, formData, session) {

//     const user = session?.user;

//     const commentInput = formData.get("commentInput").toString();

//     if (!postId) {
//         throw new Error("Post ID is required");
//     }
//     if (!commentInput) {
//         throw new Error("Comment input is required");
//     }
//     if (!user?.userId) {
//         throw new Error("User not authenticated");
//     }

//     const userDB = {
//         userId: user.userId,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         userImage: user.profileImage || "",
//     };

//     const post = await Post.findById(postId);

//     if (!post) {
//         throw new Error("Post not found");
//     }

//     const comment = {
//         user: userDB,
//         text: commentInput,
//     };

//     try {
//         await post.commentOnPost(comment);

//           // Initialize notifications if not present
//         if (!Array.isArray(post.notifications)) {
//         post.notifications = [];
//         }

//          // Add a notification for the comment
//          post.notifications.push({
//             type: "comment",
//             userId: user.userId,
//             userFirstName: user.firstName,
//             userLastName: user.lastName,
//             text: commentInput,
//             createdAt: new Date(),
//         });

//         // Save the post with the new comment and notification
//         await post.save();


//         revalidatePath('/');
//     } catch (error) {
//         console.error("Error creating comment:", error); // Log the actual error
//         throw new Error("Error creating comment"); // This is the message that appears in the stack trace
//     }
// }

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


