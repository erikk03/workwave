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

        const { userIds } = await req.json();
        
        if (!Array.isArray(userIds) || userIds.length === 0) {
            throw new Error("No userIds provided or userIds is not an array");
        }

        // Fetch users with related posts, comments, job listings, and friends
        const users = await User.find({ _id: { $in: userIds } })
            .populate('friends', 'firstName lastName profileImage')
            .lean();

        // console.log("Users found:", users);

        if (!users || users.length === 0) {
            return new Response("No users found", { status: 404 });
        }

        const usersWithPostsAndListings = await Promise.all(users.map(async (user) => {
            const posts = await Post.find({ "user.userId": user._id }).populate('comments').lean();

            const listings = await Listing.find({ postedById: user._id }).lean();

            const comments = await Comment.find({ "user.userId": user._id }).lean();

            return {
                ...user,
                posts,
                listings,
                comments,
            };
        }));

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
