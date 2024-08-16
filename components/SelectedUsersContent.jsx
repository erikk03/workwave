"use client"; // Ensure this file runs on the client side

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Avatar, Button } from "@nextui-org/react";

export default function SelectedUsersContent() {
    const searchParams = useSearchParams();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const selectedUserIds = JSON.parse(searchParams.get("selectedUsers") || "[]");

        // Fetch the details of selected users
        const fetchSelectedUsers = async () => {
            try {
                const response = await fetch("/api/users/selected", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ userIds: selectedUserIds }),
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch selected users');
                }
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSelectedUsers();
    }, [searchParams]);

    if (loading) return <div>Loading user data...</div>;

    if (error) return <div>Error: {error}</div>;

    // Function to download selected users' data as JSON
    const downloadJson = () => {
        const json = JSON.stringify(users, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "selected_users.json";
        link.click();
        URL.revokeObjectURL(url);
    };

    // Function to download selected users' data as XML
    const downloadXml = () => {
        const xml = users.map(user => `
        <user>
            <firstName>${user.firstName}</firstName>
            <lastName>${user.lastName}</lastName>
            <email>${user.email}</email>
            <phone>${user.phone}</phone>
        </user>`).join('');

        const xmlBlob = new Blob([`<users>${xml}</users>`], { type: "application/xml" });
        const url = URL.createObjectURL(xmlBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "selected_users.xml";
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-semibold mb-6">Selected Users</h1>
            <div className="bg-white p-4 rounded-xl shadow-sm">
                {users.length === 0 ? (
                    <div>No users selected.</div>
                ) : (
                    <>
                        <table className="w-full border-collapse mb-4">
                            <thead>
                                <tr>
                                    <th className="p-2 text-left">Profile</th>
                                    <th className="p-2 text-left">Name</th>
                                    <th className="p-2 text-left">Email</th>
                                    <th className="p-2 text-left">Phone</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user._id} className="border-t">
                                        <td className="p-2">
                                            {user.profileImage ? (
                                                <Avatar
                                                    isBordered
                                                    color="primary"
                                                    size="sm"
                                                    radius="md"
                                                    src={user.profileImage}
                                                />
                                            ) : (
                                                <Avatar
                                                    isBordered
                                                    color=""
                                                    size="sm"
                                                    radius="md"
                                                    name={user.firstName.charAt(0) + user.lastName.charAt(0)}
                                                />
                                            )}
                                        </td>
                                        <td className="p-2">
                                            {user.firstName} {user.lastName}
                                        </td>
                                        <td className="p-2">{user.email}</td>
                                        <td className="p-2">{user.phone}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="flex gap-4">
                            <Button
                                color="primary"
                                size="md"
                                radius="sm"
                                variant="flat"
                                onClick={downloadJson}
                            >
                                Download JSON
                            </Button>
                            <Button
                                color="default"
                                size="md"
                                radius="sm"
                                variant="flat"
                                onClick={downloadXml}
                            >
                                Download XML
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
