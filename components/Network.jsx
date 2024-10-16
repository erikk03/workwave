"use client";

import { useEffect, useState } from "react";
import { Avatar } from "@nextui-org/avatar";
import { useRouter } from "next/navigation";
import { Button } from "@nextui-org/react";
import { useSession } from "next-auth/react";


export default function Network() {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [allUsers, setAllUsers] = useState([]); // Store all users for resetting search results
    const [users, setUsers] = useState([]); // State to hold current list of users
    const [sentRequests, setSentRequests] = useState(new Set()); // Track sent requests
    const [friendIds, setFriendIds] = useState(new Set()); // Track friend IDs
    const router = useRouter();
    const { data: session, status } = useSession();

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
            } finally {
                setLoading(false);
            }
        };

        fetchFriends();
    }, []);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/users');
                if (!response.ok) {
                    throw new Error("Failed to fetch users");
                }
                const data = await response.json();
                setAllUsers(data); // Save all users
                setUsers(data); // Initialize users list
            } catch (error) {
                console.error("Error fetching users:", error);
                setError(error.message);
            }
        };

        fetchUsers();
    }, []);

    const handleSearch = () => {
        if (searchQuery.trim() === '') {
            setUsers(allUsers); // Reset to all users if search query is empty
        } else {
            const filteredUsers = allUsers.filter(user =>
                user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.lastName.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setUsers(filteredUsers);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleSendRequest = async (userId) => {
        try {
            const response = await fetch("/api/friends/request", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ targetUserId: userId }),
            });
            if (!response.ok) throw new Error("Failed to send friend request");
            setSentRequests(prev => new Set(prev).add(userId)); // Track request as sent
        } catch (error) {
            alert(error.message);
        }
    };

    const handleRemoveFriend = async (friendId) => {
        try {
            const response = await fetch("/api/friends/remove", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ friendId }),
            });
            if (!response.ok) throw new Error("Failed to remove friend");

            // Update friends state to remove the friend from the list
            setFriends(prevFriends => prevFriends.filter(friend => friend._id !== friendId));
            setFriendIds(prevIds => {
                const updatedIds = new Set(prevIds);
                updatedIds.delete(friendId);
                return updatedIds;
            });
        } catch (error) {
            alert(error.message);
        }
    };

    const goToUserProfile = (userId) => {
        router.push(`/userinfo/${userId}`);
    };

    return (
        <div className="col-span-full md:col-span-6 md:max-w-2xl xl:col-span-4 xl:max-w-5xl sm:max-w-md mx-auto w-full">
            <div className="mt-5 bg-white rounded-xl p-6">
                <div className="ml-1 mr-1 flex items-center justify-center mb-1">
                    <h1 className="text-2xl font-semibold mb-4">My Network</h1>
                </div>
                {loading ? (
                    <div className="text-center">Loading...</div>
                ) : error ? (
                    <div className="text-center text-red-500">Error: {error}</div>
                ) : friends.length > 0 ? (
                    friends.map(friend => (
                        <div
                            key={friend._id}
                            className="ml-1 mr-1 flex items-center mb-4 cursor-pointer bg-gray-100 p-1 rounded-xl hover:bg-gray-200 transition border max-h-[500px] overflow-y-auto"
                            onClick={() => goToUserProfile(friend._id)}
                        >
                            {friend.profileImage ? (
                                <Avatar
                                    color="primary"
                                    size="md"
                                    radius="full"
                                    src={friend.profileImage}
                                />
                            ) : (
                                <Avatar
                                    color=""
                                    size="md"
                                    radius="full"
                                    name={friend?.firstName.charAt(0) + friend?.lastName.charAt(0)}
                                />
                            )}

                            <div className="ml-4 flex-1">
                                <h2 className="text-lg font-medium">
                                    {friend.firstName} {friend.lastName}
                                </h2>
                                <h2 className="text-sm">
                                    {friend.position} at {friend.industry}
                                </h2>
                            </div>
                            <Button
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent clicking on the button from triggering the parent div's click event
                                    handleRemoveFriend(friend._id);
                                }}
                                size="sm"
                                color="danger"
                                variant="solid"
                            >
                                Remove
                            </Button>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500">You have no friends yet.</p>
                )}

                {/* Search bar */}
                <hr className="mb-4" style={{ borderColor: "gray" }} />
                <div className="ml-1 mr-1 mt-1 flex items-center space-x-2">
                    <input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleKeyPress}
                        className="flex-1 outline-none rounded-full px-4 bg-gray-200"
                        style={{ height: '35px' }}
                    />
                    <Button onClick={handleSearch} radius="full" color="primary" variant="ghost" size="sm">Search</Button>
                </div>

                {/* Display search results */}
                <div className="ml-1 mr-1 mt-6">
                    <h2 className="text-xl font-semibold mb-1">Users</h2>
                    <ul className="border-gray-300 rounded-xl border max-h-[500px] overflow-y-auto">
                        {users.filter(user => !user.isAdmin && user._id !== session.user.userId).map(user => (
                            <li key={user._id} className="flex items-center mt-2 ml-2 mr-2 mb-2 justify-between bg-gray-100 p-1 rounded-lg">
                                <a 
                                    href={`/userinfo/${user._id}`} 
                                    className="text-blue-600 flex items-center hover:underline"
                                >
                                    {user.profileImage ? (
                                        <Avatar
                                            color="primary"
                                            size="sm"
                                            radius="full"
                                            src={user.profileImage}
                                            className="mr-2"
                                        />
                                    ) : (
                                        <Avatar
                                            color=""
                                            size="sm"
                                            radius="full"
                                            name={user?.firstName.charAt(0) + user?.lastName.charAt(0)}
                                            className="mr-2"
                                        />
                                    )}
                                    {user.firstName} {user.lastName}
                                </a>
                                <Button
                                    onClick={() => handleSendRequest(user._id)}
                                    size="sm"
                                    color={
                                        friendIds.has(user._id) ? "default" :
                                        sentRequests.has(user._id) ? "success" : "default"
                                    }
                                    variant={
                                        friendIds.has(user._id) ? "flat" :
                                        sentRequests.has(user._id) ? "solid" : "ghost"
                                    }
                                    disabled={friendIds.has(user._id)} // Disable if already friends
                                >
                                    {friendIds.has(user._id)
                                        ? "Already Friends"
                                        : sentRequests.has(user._id)
                                        ? "Request Sent"
                                        : "Send Request"}
                                </Button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}