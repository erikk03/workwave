// "use client"; // Ensure this file runs on the client side

// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import { Avatar, Button } from "@nextui-org/react"; // Assuming you're using @nextui-org/react for UI components

// export default function AdminPage() {
//     const { data: session, status } = useSession();
//     const router = useRouter();
//     const [users, setUsers] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         if (status === "loading") return; // Do nothing while loading

//         if (!session || !session.user.isAdmin) {
//             router.push("/"); // Redirect to home page if not admin
//             return;
//         }

//         // Fetch users from the API
//         const fetchUsers = async () => {
//             try {
//                 const response = await fetch("/api/users");
//                 if (!response.ok) {
//                     throw new Error('Failed to fetch users');
//                 }
//                 const data = await response.json();
//                 setUsers(data);
//             } catch (error) {
//                 setError(error.message);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchUsers();
//     }, [session, status, router]);

//     if (status === "loading") return <div>Loading...</div>;

//     if (loading) return <div>Loading users...</div>;

//     if (error) return <div>Error: {error}</div>;

//     // Function to download user data as JSON
//     const downloadJson = (user) => {
//         const json = JSON.stringify(user, null, 2);
//         const blob = new Blob([json], { type: "application/json" });
//         const url = URL.createObjectURL(blob);
//         const link = document.createElement("a");
//         link.href = url;
//         link.download = `${user.firstName}_${user.lastName}.json`;
//         link.click();
//         URL.revokeObjectURL(url);
//     };

//     // Function to download user data as XML
//     const downloadXml = (user) => {
//         const xml = `
//         <user>
//             <firstName>${user.firstName}</firstName>
//             <lastName>${user.lastName}</lastName>
//             <email>${user.email}</email>
//             <phone>${user.phone}</phone>
//         </user>`;
//         const blob = new Blob([xml], { type: "application/xml" });
//         const url = URL.createObjectURL(blob);
//         const link = document.createElement("a");
//         link.href = url;
//         link.download = `${user.firstName}_${user.lastName}.xml`;
//         link.click();
//         URL.revokeObjectURL(url);
//     };

//     return (
//         <div className="p-6 bg-gray-100 min-h-screen">
//             <h1 className="text-2xl font-semibold mb-6">Admin Page</h1>
//             <p className="mb-4">Welcome, {session.user.firstName}!</p>
//             <h2 className="text-xl font-semibold mb-4">User List</h2>
//             <div className="bg-white p-4 rounded-xl shadow-sm">
//                 {users.length === 0 ? (
//                     <div>No users found.</div>
//                 ) : (
//                     <table className="w-full border-collapse">
//                         <thead>
//                             <tr>
//                                 <th className="p-2 text-left">Profile</th>
//                                 <th className="p-2 text-left">Name</th>
//                                 <th className="p-2 text-left">Email</th>
//                                 <th className="p-2 text-left">Phone</th>
//                                 <th className="p-2 text-left">Download</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {users.map((user) => (
//                                 <tr key={user._id} className="border-t">
//                                     <td className="p-2">
//                                         {user.profileImage ? (
//                                             <Avatar
//                                                 isBordered
//                                                 color="primary"
//                                                 size="sm"
//                                                 radius="md"
//                                                 src={user.profileImage}
//                                             />
//                                         ) : (
//                                             <Avatar
//                                                 isBordered
//                                                 color=""
//                                                 size="sm"
//                                                 radius="md"
//                                                 name={user.firstName.charAt(0) + user.lastName.charAt(0)}
//                                             />
//                                         )}
//                                     </td>
//                                     <td className="p-2">
//                                         {user.firstName} {user.lastName}
//                                     </td>
//                                     <td className="p-2">{user.email}</td>
//                                     <td className="p-2">{user.phone}</td>
//                                     <td className="p-2">
//                                         <div className="flex gap-2">
//                                             <Button
//                                                 color="primary"
//                                                 size="sm"
//                                                 radius="sm"
//                                                 variant="flat"
//                                                 onClick={() => downloadJson(user)}
//                                             >
//                                                 Download JSON
//                                             </Button>
//                                             <Button
//                                                 color="default"
//                                                 size="sm"
//                                                 radius="sm"
//                                                 variant="flat"
//                                                 onClick={() => downloadXml(user)}
//                                             >
//                                                 Download XML
//                                             </Button>
//                                         </div>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 )}
//             </div>
//         </div>
//     );
// }

"use client"; // Ensure this file runs on the client side

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar, Button } from "@nextui-org/react";

export default function AdminPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (status === "loading") return;

        if (!session || !session.user.isAdmin) {
            router.push("/"); // Redirect to home page if not admin
            return;
        }

        const fetchUsers = async () => {
            try {
                const response = await fetch("/api/users");
                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [session, status, router]);

    if (status === "loading") return <div>Loading...</div>;
    if (loading) return <div>Loading users...</div>;
    if (error) return <div>Error: {error}</div>;

    const handleSelectUser = (userId) => {
        setSelectedUsers((prevSelectedUsers) =>
            prevSelectedUsers.includes(userId)
                ? prevSelectedUsers.filter((id) => id !== userId)
                : [...prevSelectedUsers, userId]
        );
    };

    const navigateToSelectedUsersPage = () => {
        const queryString = new URLSearchParams({
            selectedUsers: JSON.stringify(selectedUsers),
        }).toString();

        router.push(`/admin/selected-users?${queryString}`);
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-semibold mb-6">Admin Page</h1>
            <p className="mb-4">Welcome, {session.user.firstName}!</p>
            <h2 className="text-xl font-semibold mb-4">User List</h2>
            <div className="bg-white p-4 rounded-xl shadow-sm">
                {users.length === 0 ? (
                    <div>No users found.</div>
                ) : (
                    <table className="w-full border-collapse mb-4">
                        <thead>
                            <tr>
                                <th className="p-2 text-left">Select</th>
                                <th className="p-2 text-left">Profile</th>
                                <th className="p-2 text-left">Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user._id} className="border-t">
                                    <td className="p-2">
                                        <input
                                            type="checkbox"
                                            onChange={() => handleSelectUser(user._id)}
                                            checked={selectedUsers.includes(user._id)}
                                        />
                                    </td>
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
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                <div className="flex gap-4 justify-end">
                    <Button
                        color="primary"
                        size="md"
                        radius="sm"
                        variant="flat"
                        disabled={selectedUsers.length === 0}
                        onClick={navigateToSelectedUsersPage}
                    >
                        View Selected Users
                    </Button>
                </div>
            </div>
        </div>
    );
}
