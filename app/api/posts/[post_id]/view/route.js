import { connectMongoDB } from "@/lib/mongodb";
import Post from "@/models/post";
import PostInteraction from "@/models/postInteraction"; // Ensure this model is defined in your codebase
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
    const { post_id } = params;

    try {
        await connectMongoDB();

        // Extract the userId from the request body or session (whichever is appropriate)
        const { userId } = await req.json(); // Assuming userId is sent in the request body

        if (!userId) {
            return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
        }

        // Fetch the post by ID
        const post = await Post.findById(post_id);

        if (!post) {
            return NextResponse.json({ message: 'Post not found' }, { status: 404 });
        }

        // Check if the post has already been viewed by the user recently
        const lastView = post.views?.find((view) => view.userId === userId);
        
        if (lastView ) {
            return NextResponse.json({ message: 'View already logged recently.' }, { status: 200 });
        }

        // Log the view
        post.views.push({ userId, timestamp: new Date() });
        await post.save();

        // Increment interaction count
        await PostInteraction.findOneAndUpdate(
            { userId: userId, postId: post_id },
            { $inc: { interaction: 1 } },
            { upsert: true }
        );

        return NextResponse.json({ message: 'View logged successfully.' }, { status: 200 });
    } catch (error) {
        console.error('Error logging view:', error);
        return NextResponse.json({ message: 'Error logging view.' }, { status: 500 });
    }
}
