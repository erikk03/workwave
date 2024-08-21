import { connectMongoDB } from "@/lib/mongodb";
import Post from "@/models/post";
import User from "@/models/user";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    await connectMongoDB();
    params.post_id.toString();

    try {
        const post = await Post.findById(params.post_id);
        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        const likes = post.likes.map(like => like.toString()); // Convert likes to string if necessary
        return NextResponse.json(likes);
    } catch (error) {
        return NextResponse.json(
            { error: "An error occurred while fetching likes" },
            { status: 500 }
        );
    }
}

export async function POST(request, { params }) {
    await connectMongoDB();
    params.post_id.toString();

    try {
        const { userId } = await request.json();
        const post = await Post.findById(params.post_id);

        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        await post.likePost(userId.toString());

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const notification = {
            type: "like",
            userId: userId,
            userFirstName: user.firstName,
            userLastName: user.lastName,
            createdAt: new Date(),
        }

        await post.addLikeNotification(notification);

        await post.save();
        return NextResponse.json({ message: "Post liked successfully" });
    } catch (error) {
        return NextResponse.json(
            { error: "An error occurred while liking the post" },
            { status: 500 }
        );
    }
}

  