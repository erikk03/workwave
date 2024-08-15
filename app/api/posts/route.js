import { NextResponse } from "next/server";
import connectDB from "@/mongodb/db"; // Import the connectDB function from the appropriate file
import Post from "@/models/post"; // Import the Post model
import { useSession } from "next-auth/react";

export async function POST(request) {
    const { data: session, status } = useSession();
    
    if (!session) {
        return NextResponse.json({ error: "You need to be authenticated to create a post" },{ status: 401 });
    }


    try {
        await connectDB();
        const { user, text, imageUrl } = await request.json();

        const postData = {
            user,
            text,
            ...(imageUrl && { imageUrl }),
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
        await connectDB();
        const posts = await Post.getAllPosts();

        return NextResponse.json({ posts });
    } catch (error) {
        return NextResponse.json(
            { error: "An error occurred while fetching posts" },
            { status: 500 }
        );
    }
}
