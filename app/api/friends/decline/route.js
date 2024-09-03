import { getServerSession } from "next-auth";
import User from "@/models/user";
import { connectMongoDB } from "@/lib/mongodb";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.userId) {
            return new Response("Unauthorized", { status: 401 });
        }

        await connectMongoDB();

        const { requesterId } = await req.json();

        if (!requesterId) {
            return new Response("Requester ID is required", { status: 400 });
        }

        const user = await User.findById(session.user.userId);

        if (!user || !user.pendingRequests.includes(requesterId)) {
            return new Response("No pending request from this user", { status: 400 });
        }

        // Remove the requester from the pendingRequests list without adding them to friends
        user.pendingRequests = user.pendingRequests.filter(id => id.toString() !== requesterId);

        await user.save();

        return new Response("Friend request declined", { status: 200 });
    } catch (error) {
        console.error("Error declining friend request:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
