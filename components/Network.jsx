"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { useRouter } from 'next/navigation'; // Import useRouter

export default function Network() {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter(); // Initialize useRouter

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
            } catch (error) {
                console.error("Fetch error:", error); // Log the full error
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFriends();
    }, []);

    return (
        <div className="min-h-screen flex flex-col">
            <header className="border-b sticky top-0 bg-white z-50">
                <Header />
            </header>

            <div className="grid grid-cols-8 mt-5 sm:px-5">
                <section className="col-span-full md:col-span-6 xl:col-span-4 xl:max-w-xl mx-auto w-full">
                    <h1 className="text-2xl font-semibold mb-4">Your Network</h1>
                    
                    <div className="flex justify-between mb-4">
                        <button
                            onClick={() => router.push('/friendrequest')}
                            className="btn btn-primary"
                        >
                            Send Friend Request
                        </button>
                        {/* <button
                            onClick={() => router.push('/receivefriendrequest')}
                            className="btn btn-primary"
                        >
                            View Friend Requests
                        </button> */}
                    </div>

                    {loading ? (
                        <div className="text-center">Loading...</div>
                    ) : error ? (
                        <div className="text-center text-red-500">Error: {error}</div>
                    ) : friends.length > 0 ? (
                        friends.map(friend => (
                            <div key={friend._id} className="flex items-center mb-4">
                                <img src={friend.profileImage || '/default-avatar.png'} alt="Profile" className="w-12 h-12 rounded-full" />
                                <div className="ml-4">
                                    <h2 className="text-lg font-medium">{friend.firstName} {friend.lastName}</h2>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>You have no friends yet.</p>
                    )}
                </section>
            </div>
        </div>
    );
}
