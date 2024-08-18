// components/ReceiveFriendRequests.jsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@nextui-org/react";

export default function ReceiveFriendRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await fetch("/api/friends/requests"); // Update to the correct endpoint to fetch requests
                if (!response.ok) throw new Error("Network response was not ok");
                const data = await response.json();
                setRequests(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, []);

    const handleAcceptRequest = async (requesterId) => {
        try {
            const response = await fetch("/api/friends/accept", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ requesterId }),
            });
            if (!response.ok) throw new Error("Failed to accept friend request");
            alert("Friend request accepted!");
            setRequests(requests.filter((req) => req._id !== requesterId));
        } catch (error) {
            alert(error.message);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h1>Pending Friend Requests</h1>
            {requests.length > 0 ? (
                <ul>
                    {requests.map((request) => (
                        <li key={request._id}>
                            {request.firstName} {request.lastName}
                            <Button onClick={() => handleAcceptRequest(request._id)}>Accept</Button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No pending friend requests.</p>
            )}
        </div>
    );
}
