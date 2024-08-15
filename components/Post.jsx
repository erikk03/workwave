"use client";

import { useSession } from "next-auth/react";
import { Avatar } from "@nextui-org/avatar";
import { Badge } from "@nextui-org/badge";
import { Button } from "@nextui-org/button";
import { Trash2 } from "lucide-react";
import ReactTimeago from "react-timeago";
// import {Image} from "@nextui-org/image";
import Image from "next/image"
// import deletePostAction from "@/actions/deletePostAction";
// import PostOptions from "./PostOptions";
// import { toast } from "sonner";

function Post({post}) {
    const { data: session, status } = useSession();
    const user = session?.user;

    const isAuthor = user?.userId === post.user.userId;



    return (
    <div className="bg-white rounded-xl border">
        <div className="p-4 flex space-x-2">
            <div>
                {post?.user?.profileImage ? (
                    <Avatar
                        color=""
                        size="md"
                        radius="full"
                        src={post?.user?.profileImage}
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
                <div className="">
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
                

                {isAuthor && (
                    <Button
                        style={{padding: "5px"}}
                        color="danger"
                        size="sm"
                        radius="sm"
                        variant="faded" 
                        // onClick={() => {
                        //     // const promise = 
                        //     deletePostAction(post.postId);
                            
                        //     // toast.promise(promise, {
                        //     //     loading: "Deleting post...",
                        //     //     success: "Post deleted!",
                        //     //     error: (e) => "Error deleting post: " + e.message,
                        //     // });
                        // }}
                        >
                        <Trash2 style={{padding: "5px"}}/>
                    </Button>
                )}
            </div>
        </div>
        
        <hr />
        
        <div>
            <p className="px-4 pb-2 mt-2">{post.text}</p>

            {/* if image uploaded show it here... */}
            {post.imageUrl && (
                <Image
                    layout="responsive"
                    style={{ objectFit: 'cover' }}
                    width={500}
                    height={500}
                    src={post.imageUrl}
                    alt="Post image"
                />
            )}
        </div>

        {/* <PostOptions 
            postId={post._id}
            post={post}
        /> */}
    </div>
    );
}

export default Post;