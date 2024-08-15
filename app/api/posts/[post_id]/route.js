import connectDB from "@/mongodb/db";
import Post from "@/models/post"; // Importing Post as default
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    await connectDB();
    try {
        const post = await Post.findById(params.post_id);

        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        return NextResponse.json(post);
    } catch (error) {
        return NextResponse.json(
            { error: `An error occurred while fetching the post: ${error}` },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {

    await connectDB();

    const { userId } = await request.json();

    try {
        const post = await Post.findById(params.post_id);

        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        if (post.user.userId !== userId) {
            throw new Error("User not authorized to delete this post");
        }

        await post.removePost();

        return NextResponse.json({ message: "Post removed successfully" });
    } catch (error) {
        return NextResponse.json(
            { error: `An error occurred while removing the post: ${error}` },
            { status: 500 }
        );
    }
}
