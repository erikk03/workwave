// app/api/friends/request/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import User from "@/models/user";
import { connectMongoDB } from "@/lib/mongodb";

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.userId) {
            return new Response("Unauthorized", { status: 401 });
        }

        await connectMongoDB();

        const { targetUserId } = await req.json();

        if (!targetUserId) {
            return new Response("Target user ID is required", { status: 400 });
        }

        const user = await User.findById(session.user.userId);
        const targetUser = await User.findById(targetUserId);

        if (!targetUser) {
            return new Response("User not found", { status: 404 });
        }

        if (user.friends.includes(targetUserId)) {
            return new Response("Already a friend", { status: 400 });
        }

        if (targetUser.pendingRequests.includes(session.user.userId)) {
            return new Response("Friend request already sent", { status: 400 });
        }

        targetUser.pendingRequests.push(session.user.userId);
        await targetUser.save();

        return new Response("Friend request sent", { status: 200 });
    } catch (error) {
        console.error("Error processing friend request:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}

