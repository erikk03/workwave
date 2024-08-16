'use server';

import Post from "@/models/post"
import { revalidatePath } from "next/cache";

export default async function deletePostAction(postId, session) {
    const user = session?.user;

    if (!user?.userId) {
        throw new Error("User not authenticated");
    }

    const post = await Post.findById(postId);

    if (!post) {
        throw new Error("Post not found");
    }

    if (post.user.userId !== user.userId) {
        throw new Error("User not authorized to delete this post");
    }

    try{
        await post.removePost();
        console.log(">>> Post removed succesfully!");
        revalidatePath("/");
    }catch(error){
        console.error("Error when removing post", error);
        throw new Error("Failed to delete post");
    }
}