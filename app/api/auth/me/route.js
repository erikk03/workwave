import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import User from "@/models/user";
import { connectMongoDB } from "@/lib/mongodb";

export async function GET(req) {
  // Connect to the database
  await connectMongoDB();
  
  // Get the session from NextAuth
  const session = await getServerSession(authOptions);

  if (session) {
    try {
      // Find the user by the userId stored in the session
      const user = await User.findById(session.user.userId).exec();
      
      if (user) {
        // Send the user data as response
        return new Response(JSON.stringify(user), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      } else {
        // User not found
        return new Response(JSON.stringify({ message: "User not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      return new Response(JSON.stringify({ message: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  } else {
    // No session found
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
}
