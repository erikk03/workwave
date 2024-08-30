"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {Avatar} from "@nextui-org/avatar";

export default function Connections() {
    const [friends, setFriends] = useState([]);
    const [error, setError] = useState(null);
    const [friendIds, setFriendIds] = useState(new Set()); // Track friend IDs
    const router = useRouter();
    
    const goToUserProfile = (userId) => {
        router.push(`/userinfo/${userId}`);
    };

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const response = await fetch('/api/friends/list');
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Network response was not ok: ${errorText}`);
                }
                const friendsList = await response.json();
                setFriends(friendsList);
                // Update friend IDs for quick lookup
                setFriendIds(new Set(friendsList.map(friend => friend._id)));
            } catch (error) {
                console.error("Fetch error:", error);
                setError(error.message);
            }
        };

        fetchFriends();
    }, []);

    return(
        <div>
            {friends.length > 0 ? (
                friends.map(friend => (
                    <div
                        key={friend._id}
                        className="p-1 mb-2 flex items-center cursor-pointer bg-gray-100 rounded-xl hover:bg-gray-200 transition border max-h-[500px] overflow-y-auto"
                        onClick={() => goToUserProfile(friend._id)}
                    >
                        {friend.profileImage ? (
                            <Avatar
                                color="primary"
                                size="sm"
                                radius="full"
                                src={friend.profileImage}
                            />
                        ) : (
                            <Avatar
                                color=""
                                size="sm"
                                radius="full"
                                name={friend?.firstName.charAt(0) + friend?.lastName.charAt(0)}
                            />
                        )}
            
                        <div className="ml-4 flex flex-col">
                            <span className="text-lg font-semibold">
                                {friend.firstName} {friend.lastName}
                            </span>
                            <span className="text-sm text-gray-600">
                                {friend.position} {friend.industry}
                            </span>
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-center text-gray-500">You have no friends yet.</p>
            )}
        </div>
    );
}

