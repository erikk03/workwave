"use client";

import { useState, useEffect } from "react";
import { Button, Input } from "@nextui-org/react";

export default function SendFriendRequest() {
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch("/api/users"); 
                if (!response.ok) throw new Error("Network response was not ok");
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleSendRequest = async () => {
        if (!selectedUsers.length === 0) return; 

        try {
            const response = await fetch("/api/friends/request", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ targetUserId: selectedUsers }),
            });
            if (!response.ok) throw new Error("Failed to send friend request");
            alert("Friend request sent successfully!");
        } catch (error) {
            alert(error.message);
        }
    };

    const handleUserSelection = (userId) => {
        setSelectedUsers((prevSelected) => {
            if (prevSelected.includes(userId)) {
                // If user is already selected, remove them
                return prevSelected.filter((id) => id !== userId);
            } else {
                // Otherwise, add them to the selection
                return [...prevSelected, userId];
            }
        });
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="col-span-full md:col-span-6 md:max-w-2xl xl:col-span-4 xl:max-w-5xl sm:max-w-md mx-auto w-full">
            <div className="mt-5 bg-white rounded-xl border border-black p-6">
                <h1 className="text-2xl font-semibold mb-4">Send Friend Request</h1>

                {/* Search Bar */}
                <div className="mb-4 flex flex-col sm:flex-row items-center gap-4">
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="w-full"
                    />
                    <Button
                        onClick={handleSendRequest}
                        disabled={selectedUsers.length === 0} // Disable if no users are selected
                        color="primary"
                        size="sm"
                        variant="ghost"
                    >
                        Send Request
                    </Button>
                </div>

                {/* User List */}
                <ul className="space-y-2">
                    {users.map((user) => (
                        <li
                            key={user._id}
                            className="flex justify-between items-center bg-gray-100 p-3 rounded-lg"
                        >
                            <span>
                                {user.firstName} {user.lastName}
                            </span>
                            <Button
                                onClick={() => handleUserSelection(user._id)}
                                size="sm"
                                color={selectedUsers.includes(user._id) ? "success" : "default"}
                                variant={selectedUsers.includes(user._id) ? "solid" : "ghost"}
                            >
                                {selectedUsers.includes(user._id) ? "Selected" : "Select"}
                            </Button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
