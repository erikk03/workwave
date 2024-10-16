export const dynamic = 'force-dynamic';

// app/api/friends/requests/route.js
import { getServerSession } from "next-auth";
import User from "@/models/user";
import { connectMongoDB } from "@/lib/mongodb";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.userId) return new Response("Unauthorized or User ID is missing", { status: 401 });

        await connectMongoDB();

        const user = await User.findById(session.user.userId);

        if (!user) return new Response("User not found", { status: 404 });

         // Use lean() to convert Mongoose documents to plain JavaScript objects
         const requests = await User.find({ _id: { $in: user.pendingRequests } })
         .select('firstName lastName _id')
         .lean();  // Convert to plain objects


        return new Response(JSON.stringify(requests), { status: 200 });
    } catch (error) {
        console.error("Error fetching friend requests:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
