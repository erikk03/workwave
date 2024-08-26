"use client";

import { useSession } from "next-auth/react";
import { Avatar } from "@nextui-org/avatar";
import { Badge } from "@nextui-org/badge";
import { Button } from "@nextui-org/button";
import { Trash2, DiamondPlus } from "lucide-react";
import ReactTimeago from "react-timeago";
import Image from "next/image"
import deletePostAction from "@/actions/deletePostAction";
import PostOptions from "./PostOptions";
import { useEffect, useState } from "react";
// import { toast } from "sonner";


function Post({ post }) {
    const { data: session, status } = useSession();
    const user = session?.user;

    const [userFriendsId, setUserFriendsId] = useState([]);
    const [likedByFriend, setLikedByFriend] = useState(false);
    const [isFriend, setIsFriend] = useState(false);

    const isAuthor = user?.userId === post.user.userId;

    useEffect(() => {
        // Fetch the user's friends list from the backend or any relevant source
        const fetchUserFriends = async () => {
            if (!user?.userId) return;

            try {
                // Replace this with your actual API call to fetch friends' IDs
                const response = await fetch(`/api/friends/list`);
                const friendsData = await response.json();
                setUserFriendsId(friendsData.map(friend => friend._id)); // Assuming friendsData is an array of friend objects

            } catch (error) {
                console.error("Error fetching friends list:", error);
            }
        };

        fetchUserFriends();
    }, [user]);

    useEffect(() => {
        // Check if the post was liked by a friend
        const checkLikedByFriend = () => {
            if (userFriendsId.length === 0 || post.likes.length === 0) return;

            const likedBy = post.likes.some(like => userFriendsId.includes(like));
            setLikedByFriend(likedBy);

            // Check if post owner is a friend
            const ownerIsFriend = userFriendsId.includes(post.user.userId);
            setIsFriend(ownerIsFriend);
        };

        checkLikedByFriend();
    }, [userFriendsId, post.likes, post.user.userId]);

    // Condition to show "Liked by a friend" label
    const showLikedByFriendLabel = likedByFriend && !isFriend && !isAuthor;

    return (
    <div className="bg-white rounded-xl border mt-2">
        <div className="ml-0 p-4 flex space-x-2">
            <div>
                {post?.user?.userImage ? (
                    <Avatar
                        color=""
                        size="md"
                        radius="full"
                        src={post?.user?.userImage}
                    />
                ):(
                    <Avatar
                        color=""
                        size="md"
                        radius="full"
                        name={post?.user?.firstName.charAt(0) + post?.user?.lastName.charAt(0)}
                    />
                )}
            </div>

            <div className="flex justify-between flex-1">
                <div className=" mt-2">
                    <p className="font-semibold">
                        {post.user.firstName} {post.user.lastName}{""}
                    </p>

                    <p className="text-xs text-gray-500">
                        {post.user.email}
                    </p>

                    <p className="text-xs text-gray-500">
                        <ReactTimeago date={new Date(post.createdAt)} />
                    </p>

                    {/* <Badge variant="faded" size="sm" content="Author" color="default">
                    </Badge> */}

                </div>

                { showLikedByFriendLabel && (
                    <div className="font-semibold border rounded-md border-black flex items-center max-h-7 p-2">
                        <DiamondPlus size={15} className="mr-1"/> recommended
                    </div>
                )}
                
                {isAuthor && (
                    <Button
                        style={{padding: "5px"}}
                        color="danger"
                        size="sm"
                        radius="sm"
                        variant="faded" 
                        onClick={() => {
                            // const promise = 
                            deletePostAction(post._id.toString(), session);
                            
                            // toast.promise(promise, {
                            //     loading: "Deleting post...",
                            //     success: "Post deleted!",
                            //     error: (e) => "Error deleting post: " + e.message,
                            // });
                        }}
                        >
                        <Trash2 style={{padding: "5px"}}/>
                    </Button>
                )}
            </div>
        </div>
        
        <hr />
        
        <div>
            <p className="px-4 pb-2 mt-2">{post.text}</p>

            {/* if media uploaded show it here... */}
            {post.mediaUrl && (
                <div>
                    {post.mediaType?.startsWith('image/') ? (
                        <Image
                            layout="responsive"
                            style={{ objectFit: 'cover' }}
                            width={500}
                            height={500}
                            src={post.mediaUrl}
                            alt="Post image"
                        />
                    ) : post.mediaType?.startsWith('video/') ? (
                        <video controls className="w-full">
                            <source src={post.mediaUrl} type={post.mediaType} />
                            Your browser does not support the video tag.
                        </video>
                    ) : post.mediaType?.startsWith('audio/') ? (
                        <audio controls className="w-full">
                            <source src={post.mediaUrl} type={post.mediaType} />
                            Your browser does not support the audio element.
                        </audio>
                    ) : null}
                </div>
            )}
        </div>

        <PostOptions 
            postId={post._id.toString()}
            post={post}
        />
        
    </div>
    );
}

export default Post;