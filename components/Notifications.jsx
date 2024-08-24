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
        <div className="col-span-full md:col-span-6 md:max-w-2xl xl:col-span-4 xl:max-w-5xl sm:max-w-md mx-auto w-full">
            <div className="mt-5 bg-white rounded-xl p-3">
                <div className="flex items-center justify-center">
                    <h1 className="text-xl font-semibold">Friend Requests</h1>
                </div>
                <hr className="mt-2 mb-2"/>
                {requests.length > 0 ? (
                    <ul>
                        {requests.map((request) => (
                            <div key={request._id} className="flex justify-between items-center">
                                <span className="font-bold">{request.firstName} {request.lastName}</span>
                                <div className="justify-end space-x-1">
                                    <Button size="sm" color="success" variant="flat" onClick={() => handleAcceptRequest(request._id)}>Accept</Button>
                                    <Button size="sm" color="danger" variant="light" onClick={() => handleDeclineRequest(request._id)}>Decline</Button>
                                </div>
                            </div>
                        ))}
                    </ul>
                    ) : (
                    <p>No pending friend requests.</p>
                )}
            </div>

            <div className="mt-5 bg-white rounded-xl p-3">

                <div className="flex items-center justify-center">
                    <h1 className="text-xl font-semibold">Notifications</h1>
                </div>
                <hr className="mt-2 mb-2"/>
                {notifications.length > 0 ? (
                    <ul>
                        {notifications.map((notification) => (
                            <div key={notification._id} className="mt-2 rounded-md hover:bg-gray-200">
                                {notification.type === "like" && (
                                    <p>
                                        <span className="font-bold">{notification.userFirstName} {notification.userLastName}</span> liked your post
                                    </p>
                                )}
                                {notification.type === "comment" && (
                                    <p>
                                        <span className="font-bold">{notification.userFirstName} {notification.userLastName}</span> commented on your post: "{notification.comment}"
                                    </p>
                                )}
                            </div>
                        ))}
                    </ul>
                ) : (
                    <p>No notifications.</p>
                )}
            </div>
        </div>
    );
}
