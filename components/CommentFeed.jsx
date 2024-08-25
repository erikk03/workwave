'use client'

import { useSession } from "next-auth/react";
import {Avatar} from "@nextui-org/avatar";
import ReactTimeago from "react-timeago";

function CommentFeed( {post} ) {
    const { data: session, status } = useSession();
    const user = session?.user;
    
    const isAuthor = user?.userId === post.user.userId;

    return (
        <div className=" space-y-2 mt-3">
            {post.comments?.map(comment => (
                <div key={comment._id} className="flex items-center ml-2 space-x-2">
                    <div>
                        {comment?.user?.userImage ? (
                            <Avatar
                                color=""
                                size="sm"
                                radius="full"
                                src={comment?.user?.userImage}
                            />
                        ):(
                            <Avatar
                                color=""
                                size="sm"
                                radius="full"
                                name={comment?.user?.firstName.charAt(0) + comment?.user?.lastName.charAt(0)}
                            />
                        )}
                    </div>

                    <div className="bg-gray-100 px-4 py-2 rounded-xl w-full sm:w-auto md:min-w-[300px] ">
                        <div className="flex justify-between">
                            <div>
                                <p className="font-semibold">
                                    {comment?.user?.firstName} {comment?.user?.lastName}
                                    {/* <Badge>{isAuthor && "Author"}</Badge> */}
                                </p>
                            </div>
                            <p className="text-xs text-gray-400">
                                <ReactTimeago date={new Date(comment?.createdAt)} />
                            </p>
                        </div>
                        <p className="text-sm">
                            {comment?.text}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default CommentFeed;