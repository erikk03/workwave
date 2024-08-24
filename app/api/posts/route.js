import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Post from "@/models/post"; // Import the Post model
import { useSession } from "next-auth/react";

export async function POST(request) {
    const { data: session, status } = useSession();
    
    if (!session) {
        return NextResponse.json({ error: "You need to be authenticated to create a post" },{ status: 401 });
    }


    try {
        await connectMongoDB();
        console.log("MongoDB connection established.");
        const { user, text, mediaUrl, mediaType } = await request.json();

        const postData = {
            user,
            text,
            ...(mediaUrl && { mediaUrl }),
            ...(mediaType && {mediaType}),
        };

        const post = await Post.create(postData);
        
        return NextResponse.json({ message: "Post created successfully", post });
    } catch (error) {
        return NextResponse.json(
            { error: `An error occurred while creating the post: ${error}` },
            { status: 500 }
        );
    }
}

export async function GET(request) {
    try {
        await connectMongoDB();
        console.log("MongoDB connection established.");
        const posts = await Post.getAllPosts();

        return NextResponse.json({ posts });
    } catch (error) {
        return NextResponse.json(
            { error: "An error occurred while fetching posts" },
            { status: 500 }
        );
    }
}
