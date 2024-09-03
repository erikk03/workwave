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

        const { friendId } = await req.json();

        if (!friendId) {
            return new Response("Friend ID is required", { status: 400 });
        }

        const user = await User.findById(session.user.userId);
        const friend = await User.findById(friendId);

        if (!user || !friend) {
            return new Response("User or friend not found", { status: 404 });
        }

        // Check if they are friends
        if (!user.friends.includes(friendId) || !friend.friends.includes(user._id)) {
            return new Response("Users are not friends", { status: 400 });
        }

        // Remove each other from the friends list
        user.friends = user.friends.filter(id => id.toString() !== friendId);
        friend.friends = friend.friends.filter(id => id.toString() !== user._id.toString());

        // Save the updated user and friend documents
        await user.save();
        await friend.save();

        return new Response("Friend removed successfully", { status: 200 });
    } catch (error) {
        console.error("Error removing friend:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
