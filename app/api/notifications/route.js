export const dynamic = 'force-dynamic';

import { connectMongoDB } from "@/lib/mongodb";
import Post from "@/models/post";
import { Listing } from "@/models/listing"; // Import Listing model
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        // Get the user session
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Connect to the MongoDB database
        await connectMongoDB();
        const userId = session.user.userId;
        
        // Fetch notifications from posts
        const posts = await Post.find({ "user.userId": userId })
            .populate({
                path: "notifications",
                select: "type userId userFirstName userLastName comment postId createdAt",
            })
            .lean();

        // Fetch notifications from listings
        const listings = await Listing.find({ "postedById": userId })
            .populate({
                path: "notifications",
                select: "type userId userFirstName userLastName comment createdAt",
            })
            .lean();

        // Collect all notifications from the user's posts and listings
        const postNotifications = posts.reduce((acc, post) => {
            const postNotifications = Array.isArray(post.notifications) ? post.notifications : [];
            acc.push(...postNotifications);
            return acc;
        }, []);

        const listingNotifications = listings.reduce((acc, listing) => {
            const listingNotifications = Array.isArray(listing.notifications) ? listing.notifications : [];
            acc.push(...listingNotifications);
            return acc;
        }, []);

        const allNotifications = [...postNotifications, ...listingNotifications];

        // Convert fields to strings and return notifications
        const plainNotifications = allNotifications.map(notification => ({
            _id: notification._id ? notification._id.toString() : null,
            type: notification.type ? notification.type.toString() : null,
            userId: notification.userId ? notification.userId.toString() : null,
            userFirstName: notification.userFirstName ? notification.userFirstName.toString() : null,
            userLastName: notification.userLastName ? notification.userLastName.toString() : null,
            comment: notification.comment ? notification.comment.toString() : null,
            postId: notification.postId ? notification.postId.toString() : null,
            createdAt: notification.createdAt ? new Date(notification.createdAt).toISOString() : null
        }));

        return NextResponse.json({ notifications: plainNotifications });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return NextResponse.json(
            { error: "An error occurred while fetching notifications" },
            { status: 500 }
        );
    }
}
