"use client";

import { useState, useEffect } from "react";
import { Button } from "@nextui-org/react";

export default function notifications() {
    const [requests, setRequests] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch friend requests
                const requestsResponse = await fetch("/api/friends/requests");
                if (!requestsResponse.ok) throw new Error("Failed to fetch friend requests");
                const requestsData = await requestsResponse.json();
                setRequests(requestsData);

                // Fetch notifications
                const notificationsResponse = await fetch("/api/notifications");
                if (!notificationsResponse.ok) throw new Error("Failed to fetch notifications");
                const notificationsData = await notificationsResponse.json();
                console.log("Fetched notifications:", notificationsData); // Debug log
                setNotifications(notificationsData.notifications || []); // Ensure notifications is an array
                
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
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

    const handleDeclineRequest = async (requesterId) => {
        try {
            const response = await fetch("/api/friends/decline", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ requesterId }),
            });
            if (!response.ok) throw new Error("Failed to decline friend request");
            alert("Friend request declined!");
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
                            <Button onClick={() => handleDeclineRequest(request._id)} color="error">Decline</Button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No pending friend requests.</p>
            )}

            <h2>Notifications</h2>
            {notifications.length > 0 ? (
                <ul>
                    {notifications.map((notification) => (
                        <li key={notification._id}>
                            {notification.type === "like" && (
                                <p>
                                    {notification.userFirstName} {notification.userLastName} liked your post.
                                </p>
                            )}
                            {notification.type === "comment" && (
                                <p>
                                    {notification.userFirstName} {notification.userLastName} commented on your post: "{notification.comment}"
                                </p>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No notifications.</p>
            )}
        </div>
    );
}
