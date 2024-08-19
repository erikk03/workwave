import React from "react";
import Post from "./Post";
import { getServerSession } from "next-auth";
import { authOptions } from "../app/api/auth/[...nextauth]/route";
import User from "@/models/user";

async function PostFeed({posts}) {
    const session = await getServerSession(authOptions);
        if (!session || !session.user?.userId) {
            return new Response("Unauthorized", { status: 401 });
        }

    const user = await User.findById(session.user.userId);
    const user_friends = user.friends;

    // Filter posts to include only those from friends
    const filteredPosts = posts?.filter(
        post => user_friends.includes(post.user.userId)     // friends posts
        + (post.user.userId === session.user.userId)        // my posts
        + (post.user.userId === '66bf7cb42d28250e53b99990') // admins posts
    );

    return <div className="space-y-5 pb-20">

        {filteredPosts?.map((post) => (
            <Post key={post._id} post={post} />
        ))}
    </div>;
}

export default PostFeed;