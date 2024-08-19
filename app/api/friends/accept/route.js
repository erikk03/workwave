// app/api/friends/accept/route.js
import { getServerSession } from "next-auth";
import User from "@/models/user";
import { connectMongoDB } from "@/lib/mongodb";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.userId) {
            return new Response("Unauthorized", { status: 401 });
        }

        await connectMongoDB();

        const { requesterId } = await req.json();
        
        console.log(":::", requesterId);

        if (!requesterId) {
            return new Response("Requester ID is required", { status: 400 });
        }

        const user = await User.findById(session.user.userId);
        const requester = await User.findById(requesterId);

        if (!user || !requester) {
            return new Response("User or requester not found", { status: 404 });
        }

        if (!user.pendingRequests.includes(requesterId)) {
            return new Response("No pending request from this user", { status: 400 });
        }

        // Add each other as friends
        user.friends.push(requesterId);
        requester.friends.push(user._id);

        // Remove the requester from the pendingRequests list
        user.pendingRequests = user.pendingRequests.filter(id => id.toString() !== requesterId);
        
        // Save the updated user and requester documents
        await user.save();
        await requester.save();

        return new Response("Friend request accepted", { status: 200 });
    } catch (error) {
        console.error("Error accepting friend request:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}

