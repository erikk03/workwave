import { getServerSession } from "next-auth";
import User from '../../../../models/user'; // Adjust path if necessary
import Post from "@/models/post";
import { connectMongoDB } from "@/lib/mongodb";
import { authOptions } from "../../auth/[...nextauth]/route";
import { Listing } from '@/models/listing';
import { Comment } from '@/models/comment';

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.userId) {
            return new Response("Unauthorized", { status: 401 });
        }

        await connectMongoDB();
        // console.log("MongoDB connection established.");

        const { userIds } = await req.json();
        
        if (!Array.isArray(userIds) || userIds.length === 0) {
            throw new Error("No userIds provided or userIds is not an array");
        }

        // console.log("Fetching users with IDs:", userIds);

        // Additional logging to verify User model
        // console.log("User model:", User);

        // Fetch users with related posts, comments, job listings, and friends
        const users = await User.find({ _id: { $in: userIds } })
            .populate('friends', 'firstName lastName profileImage')
            .lean();

        // console.log("Users found:", users);

        if (!users || users.length === 0) {
            // console.log("No users found for given IDs:", userIds);
            return new Response("No users found", { status: 404 });
        }

        const usersWithPostsAndListings = await Promise.all(users.map(async (user) => {
            // console.log(`Fetching posts for user ID: ${user._id}`);
            const posts = await Post.find({ "user.userId": user._id }).populate('comments').lean();

            // console.log(`Fetching listings for user ID: ${user._id}`);
            const listings = await Listing.find({ postedById: user._id }).lean();

            // console.log(`Fetching comments for user ID: ${user._id}`);
            const comments = await Comment.find({ "user.userId": user._id }).lean();

            return {
                ...user,
                posts,
                listings,
                comments,
            };
        }));

        // console.log("Users with posts and listings:", usersWithPostsAndListings);

        return new Response(JSON.stringify(usersWithPostsAndListings), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.error("Error fetching selected users data:", error);
        return new Response(`Internal Server Error: ${error.message}`, { status: 500 });
    }
}
