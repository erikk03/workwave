import React from "react";
import Post from "./Post";

function PostFeed({posts}) {
    return <div className="space-y-5 pb-20">
        {posts?.map((post) => (
            <Post key={post._id} post={post} />
            
        ))}
    </div>;
}

export default PostFeed;