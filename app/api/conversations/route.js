// app/api/conversations/route.js
import { getServerSession } from "next-auth";
import { connectMongoDB } from "@/lib/mongodb"; // Adjust import path as needed
import Conversation from "@/models/conversation"; // Adjust import path as needed
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req, res) {
  // Connect to MongoDB
  await connectMongoDB();

  // Get the user session
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    // Find all conversations where the user is a participant
    const userId = session.user.userId; // Adjust according to your session structure
    const conversations = await Conversation.find({
      participants: userId
    }).populate('participants', '_id firstName lastName profileImage') // Populate participant details if needed

    // Return the conversations as JSON
    return new Response(JSON.stringify(conversations), { status: 200 });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
