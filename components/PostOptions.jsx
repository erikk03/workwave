'use client'

import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { HeartIcon, MessageCircle, Repeat2, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@nextui-org/button";

// import CommentFeed from "./CommentFeed";
// import CommentForm from "./CommentForm";
// import { toast } from "sonner";

function PostOptions({postId, post}) {
    const [isCommentsOpen, setIsCommentsOpen] = useState(false);
    const [liked, setLiked] = useState(false);
    const [likes, setLikes] = useState(post.likes);

    const { data: session, status } = useSession();
    const user = session?.user;
    
    useEffect(() => {
        if(user?.userId && post.likes?.includes(user.userId)){ 
            setLiked(true);
        }
    }, [post, user]);


    const likeOrUnlikePost = async () => {
        if (!user?.userId) {
          throw new Error("User not authenticated");
        }
    
        const originalLiked = liked;
        const originalLikes = likes;
    
        const newLikes = liked
          ? likes?.filter((like) => like !== user.userId)
          : [...(likes ?? []), user.userId];
    
        const body = {
          userId: user.userId,
        };
    
        setLiked(!liked);
        setLikes(newLikes);
        try{
            const response = await fetch(`/api/posts/${post._id}/${liked ? "unlike" : "like"}`,
            {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            }
            );
        
            if (!response.ok) {
                setLiked(originalLiked);
                setLikes(originalLikes);
            throw new Error("Failed to like/unlike post");
            }
        
            const fetchLikesResponse = await fetch(`/api/posts/${post._id}/like`);
            if (!fetchLikesResponse.ok) {
                setLiked(originalLiked);
                setLikes(originalLikes);
                throw new Error("Failed to fetch likes");
            }
        
            // const newLikesData = await fetchLikesResponse.json();
            const updatedLikes = await fetchLikesResponse.json();
        
            setLikes(updatedLikes);
        }catch(error){
            setLiked(originalLiked);
            setLikes(originalLikes);
            console.error("error");
        };
    }


    return (
        <div>
            <div className="flex justify-between">
                <div>
                    {likes && likes.length >= 0 && (
                    <p className="ml-2 mt-1 text-xs text-gray-700 cursor-pointer hover:underline">
                        {likes.length} likes
                    </p>
                    )}
                </div>

                <div>
                    {post?.comments && post?.comments.length > 0 && (
                        <p
                            onClick={() => setIsCommentsOpen(!isCommentsOpen)}
                            className="text-xs text-gray-500 cursor-pointer hover:underline"
                        >
                            {post.comments.length} comments
                        </p>
                    )}
                </div>
            </div>    
    
            <div className="flex p-1 justify-between px-2 border-t">
                <Button 
                    className="postButton"
                    variant="light"
                    

                    onClick={() => {
                        // const promise = 
                        likeOrUnlikePost();
                    
                        // toast.promise(promise, {
                        //     loading:  liked? "Unliking Post" : "Liking post...",
                        //     success: liked ? "Post unliked!" : "Post liked!",
                        //     error: (e) => liked? "Error unliking post: " + e.message : "Error liking post: " + e.message,
                        // });
                        
                    }}
                >
                    <HeartIcon
                        className={cn("mr-1", liked && "text-black fill-red-500") }
                    />
                    Like
                </Button>

                <Button
                    className="postButton"
                    variant="light"
                    
                    onClick={() => setIsCommentsOpen(!isCommentsOpen)}
                >
                    <MessageCircle
                        className={cn("mr-1", isCommentsOpen && "text-black fill-gray-500")}
                    />
                    Comment
                </Button>

                <Button 
                    isDisabled
                    className="postButton"
                    color="danger"
                    variant="light" >

                    <Repeat2 className="mr-1" />
                    Repost
                </Button>

                <Button 
                    isDisabled
                    className="postButton"
                    color="danger"
                    variant="light" >

                    <Send className="mr-1" />
                    Send
                </Button>
            </div>

            {isCommentsOpen && (
                <div className="p-4">
                    {/* <SignedIn>
                        <CommentForm postId={postId} />
                    </SignedIn> */}
                    {/* <CommentFeed post={post}   /> */}
                </div>
            )}
        </div>
    );
}

export default PostOptions;