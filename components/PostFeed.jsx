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
    const user_friendsId = user_friends.map(friend => friend.toString());

    // Filter posts to include only those from friends, the user, admin, or liked by friends
    const filteredPosts = posts?.filter(post => 
        user_friendsId.includes(post.user.userId) ||  // Friends' posts
        post.user.userId === session.user.userId  || // My posts
        post.user.userId === '66bf7cb42d28250e53b99990' ||  // Admin's posts
        post.likes.some(like => user_friendsId.includes(like))  // Posts liked by friends
    );

    return <div className="space-y-5 pb-20">

        {filteredPosts?.map((post) => (
            <Post key={post._id} post={post} />
        ))}
    </div>;
}

export default PostFeed;