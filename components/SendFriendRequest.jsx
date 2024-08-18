"use client";

import { useState, useEffect } from "react";
import { Button, Input } from "@nextui-org/react";

export default function SendFriendRequest() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch("/api/users"); // Ensure this endpoint is correct
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
        if (!selectedUser) return; // Guard clause for empty selection

        try {
            const response = await fetch("/api/friends/request", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ targetUserId: selectedUser }),
            });
            if (!response.ok) throw new Error("Failed to send friend request");
            alert("Friend request sent successfully!");
        } catch (error) {
            alert(error.message);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h1>Send Friend Request</h1>
            <div>
                <Input
                    type="text"
                    placeholder="Search users..."
                    onChange={(e) => setSelectedUser(e.target.value)}
                />
                <Button onClick={handleSendRequest} disabled={!selectedUser}>
                    Send Request
                </Button>
            </div>
            <ul>
                {users.map((user) => (
                    <li key={user._id}>
                        {user.firstName} {user.lastName}
                        <Button onClick={() => setSelectedUser(user._id)}>Select</Button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
