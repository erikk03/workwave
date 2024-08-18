'use client'

import { useSession } from "next-auth/react";
import { useRef } from "react";
import { Avatar } from "@nextui-org/avatar";
import createCommentAction from "@/actions/createCommentAction";
// import { toast } from "sonner";

function CommentForm({ postId }) {
    const { data: session, status } = useSession();
    const user = session?.user;

    const ref = useRef(null);

    const handleCommentAction = async (formData) => {
        if (!user?.userId) {
            throw new Error('User not authenticated');
        }

        try {
            await createCommentAction(postId.toString(), formData, session);
            ref.current?.reset();
        } catch (error) {
            console.log('Error creating comment: ', error);
            // Uncomment this if you want to use toast notifications
            // toast.error('Error creating comment: ' + error.message);
        }
    }

    return (
        <form
            ref={ref}
            onSubmit={(e) => {
                e.preventDefault();
                handleCommentAction(new FormData(ref.current));
            }}
            className="flex items-center space-x-1 bg-white"
            style={{ height: '30px' }} // Adjust the height value as needed
            >
            <div>
                {/* {user?.profileImage ? (
                    <Avatar
                        color=""
                        size="sm"
                        radius="full"
                        src={user?.profileImage}
                    />
                ) : (
                    <Avatar
                        color=""
                        size="sm"
                        radius="full"
                        name={user?.firstName?.charAt(0) + user?.lastName?.charAt(0)}
                    />
                )} */}
            </div>

            <div className="flex flex-1 bg-white rounded-full px-2" style={{ height: '100%' }}>
                <input
                    type="text"
                    name="commentInput"
                    placeholder="Write a comment..."
                    className="flex-1 outline-none rounded-full px-4 border bg-gray-100"
                />

                <button type="submit" hidden>
                    Comment
                </button>
            </div>
        </form>
    )
}

export default CommentForm;
