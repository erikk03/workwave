export const dynamic = 'force-dynamic';

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import User from "@/models/user";
import { connectMongoDB } from "@/lib/mongodb";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.userId) return new Response("Unauthorized or User ID is missing", { status: 401 });

        await connectMongoDB();

        const user = await User.findById(session.user.userId).populate('friends', 'firstName lastName profileImage position industry');

        if (!user) return new Response("User not found", { status: 404 });
        
        return new Response(JSON.stringify(user.friends), { status: 200 });
    } catch (error) {
        console.error("Error:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
