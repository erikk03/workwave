import { getServerSession } from "next-auth";
import Post from "@/models/post";
import { connectMongoDB } from "@/lib/mongodb";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.userId) {
            return new Response("Unauthorized", { status: 401 });
        }

        await connectMongoDB();

        const userPosts = await Post.find({ "user.userId": session.user.userId })
            .sort({ createdAt: -1 })
            .populate("comments")
            .lean();

        return new Response(JSON.stringify(userPosts), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.error("Error fetching user's posts:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
