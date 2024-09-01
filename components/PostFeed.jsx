import React from "react";
import Post from "@/models/post";
import { getServerSession } from "next-auth";
import { default as PostComponent } from "./Post";
import { authOptions } from "../app/api/auth/[...nextauth]/route";
import User from "@/models/user";
import PostInteraction from "@/models/postInteraction";
import { MatrixFactorization } from "@/lib/matrixPosts";

async function fetchAllUsersAndPosts() {
    const users = await User.find({}, '_id').lean();  // Fetch only user IDs
    const posts = await Post.find({}, '_id').lean();  // Fetch only post IDs

    const userIds = users.map(user => user._id.toString());
    const postIds = posts.map(post => post._id.toString());

    return { userIds, postIds, posts };
}

// A utility function to create mappings from user/post IDs to indices
function createMappings(userIds, postIds) {
    const userIdToIndex = {};
    const postIdToIndex = {};

    userIds.forEach((userId, index) => {
        userIdToIndex[userId] = index;
    });

    postIds.forEach((postId, index) => {
        postIdToIndex[postId] = index;
    });

    return { userIdToIndex, postIdToIndex };
}

async function calculateRecommendationsForUser(userId, numFactors = 2) {
    const { userIds, postIds, posts } = await fetchAllUsersAndPosts();

    const { userIdToIndex, postIdToIndex } = createMappings(userIds, postIds);

    const interactions = await PostInteraction.find().lean();

    const numUsers = userIds.length;
    const numPosts = postIds.length;

    const mf = new MatrixFactorization(numUsers, numPosts, numFactors);
    mf.initializeRatings(interactions, userIdToIndex, postIdToIndex);
    mf.train();

    const currentUserIndex = userIdToIndex[userId.toString()];
    const postRecommendations = Array(numPosts).fill().map((_, postIndex) => ({
        postId: postIds[postIndex],
        score: mf.predict(currentUserIndex, postIndex)
    }));

    postRecommendations.sort((a, b) => b.score - a.score);

    console.log("Post Recommendations:", postRecommendations);

    return postRecommendations;
}

async function PostFeed({searchParams}) {
    const daysRange = searchParams?.daysRange ? parseInt(searchParams.daysRange, 10) : 3;

    const session = await getServerSession(authOptions);
        if (!session || !session.user?.userId) {
            return new Response("Unauthorized", { status: 401 });
        }

    const user = await User.findById(session.user.userId);
    const user_friends = user.friends;
    const user_friendsId = user_friends.map(friend => friend.toString());

    const recommendations = await calculateRecommendationsForUser(session.user.userId);

    const posts = await Post.getAllPosts();

    // Filter posts to include only those from friends, the user, admin, or liked by friends
    const filteredPosts = posts?.filter((post) => { 
        const isFriendsPost = user_friendsId.includes(post.user.userId);                    // Friends' posts
        const isUserPost = post.user.userId === session.user.userId;                        // My posts
        const isAdminPost = post.user.userId === '66bf7cb42d28250e53b99990';                // Admin's posts
        const isLikedByFriend = post.likes.some(like => user_friendsId.includes(like));     // Posts liked by friends

        return (isFriendsPost || isUserPost || isAdminPost || isLikedByFriend);
    });

    const filteredPostsWhithinDateRange = filteredPosts?.filter((post) => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - daysRange);
        const postDate = new Date(post.createdAt);

        const result = postDate >= pastDate;
        return result;
    });

    const plainFilteredPostsWhithinDateRange = JSON.parse(JSON.stringify(filteredPostsWhithinDateRange));
        
        
    const recommendedPostsByScore = recommendations.map(rec =>
        posts.find(post => post._id.toString() === rec.postId.toString())
    ).filter(Boolean);
    
    // Exclude filtered posts from recommendations
    const uniqueRecommendedPosts = recommendedPostsByScore.filter(
        recPost => !filteredPosts.some(filteredPost => filteredPost._id.toString() === recPost._id.toString())
    );

    const plainUniqueRecommendedPosts = JSON.parse(JSON.stringify(uniqueRecommendedPosts));

    return(
        <div className="space-y-5 pb-20">
            {plainFilteredPostsWhithinDateRange?.map((post) => (
                <PostComponent key={post._id} post={post} user_friendsId={user_friendsId} />
            ))}

            <span className="flex justify-center text-gray-600">no more posts from last {daysRange} days</span>
            <a href={`/feed?daysRange=${daysRange + 3}`} className="flex justify-center text-blue-600 cursor-pointer hover:underline">load more posts</a>
            <hr className="border-black"/>
            <span className="flex justify-center text-gray-600">recommended posts</span>
            {plainUniqueRecommendedPosts?.map((post) => (
                <PostComponent key={post._id} post={post} user_friendsId={user_friendsId}/>
            ))}
        </div>
    );
}

export default PostFeed;
