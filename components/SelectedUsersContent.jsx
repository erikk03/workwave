"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Avatar, Button } from "@nextui-org/react";

export default function SelectedUsersContent() {
    const searchParams = useSearchParams();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [posts, setPosts] = useState([]);

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

    // Add this useEffect hook
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch("/api/posts", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch posts');
                }
                const data = await response.json();
                setPosts(data.posts);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
    };

    fetchPosts();
}, []);

    if (loading) return <div>Loading user data...</div>;

    if (error) return <div>Error: {error}</div>;

  // Utility function to escape special characters in XML
  const escapeXml = (unsafe) => {
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<':
                return '&lt;';
            case '>':
                return '&gt;';
            case '&':
                return '&amp;';
            case "'":
                return '&apos;';
            case '"':
                return '&quot;';
            default:
                return c;
            }
        });
    };

    

    const downloadJson = () => {
        const filteredUsers = users.map(user => ({
            profileImage: user.profileImage,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            phone: user.phone,
            cv: user.cv,
            experience: user.experience,
            posts: user.posts?.map(post => ({
                id: post._id,
                text: post.text,
            })),
            jobs: user.listings?.map(listing => ({
                id: listing._id,
                title: listing.title,
                description: listing.description,
            })),
            comments: user.comments?.map(comment => {
                const postId = posts.find(post => post.comments.some(c => c._id === comment._id))?._id;
                return {
                    postId: postId || 'Unknown',
                    text: comment.text,
                };
            }),
            friends: user.friends?.map(friend => ({
                firstName: friend.firstName,
                lastName: friend.lastName,
            })),
            likes: posts
                .filter(post => post.likes.includes(user._id))
                .map(post => ({
                    postId: post._id,
                })),
        }));

        const json = JSON.stringify(filteredUsers, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "selected_users.json";
        link.click();
        URL.revokeObjectURL(url);
    };

    const downloadXml = () => {
        const xml = users.map(user => `
            <user>
                <profileImage>${escapeXml(user.profileImage || '')}</profileImage>
                <name>${escapeXml(user.firstName)} ${escapeXml(user.lastName)}</name>
                <email>${escapeXml(user.email)}</email>
                <phone>${escapeXml(user.phone)}</phone>
                <cv>${escapeXml(user.cv || '')}</cv>
                <experience>${escapeXml(user.experience || '')}</experience>
                <posts>${(user.posts || []).map(post => `
                    <post>
                        <id>${escapeXml(post._id)}</id>
                        <text>${escapeXml(post.text)}</text>
                    </post>
                `).join('')}</posts>
                <jobs>${(user.listings || []).map(listing => `
                    <job>
                        <id>${escapeXml(listing._id)}</id>
                        <title>${escapeXml(listing.title)}</title>
                        <description>${escapeXml(listing.description)}</description>
                    </job>
                `).join('')}</jobs>
                <comments>${(user.comments || []).map(comment => {
                    const postId = posts.find(post => post.comments.some(c => c._id === comment._id))?._id;
                    return `
                        <comment>
                            <postId>${escapeXml(postId || 'Unknown')}</postId>
                            <text>${escapeXml(comment.text)}</text>
                        </comment>
                    `;
                }).join('')}</comments>
                <friends>${(user.friends || []).map(friend => `
                    <friend>
                        <firstName>${escapeXml(friend.firstName)}</firstName>
                        <lastName>${escapeXml(friend.lastName)}</lastName>
                    </friend>
                `).join('')}</friends>
                <likes>${(posts.filter(post => post.likes.includes(user._id)).map(post => `
                    <like>
                        <postId>${escapeXml(post._id)}</postId>
                    </like>
                `).join(''))}</likes>
            </user>
        `).join('');

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
                    <table className="w-full border-collapse ">
                        <thead>
                            <tr>
                                <th className="p-2 text-left">Profile</th>
                                <th className="p-2 text-left">Name</th>
                                <th className="p-2 text-left">Email</th>
                                <th className="p-2 text-left">Phone</th>
                                <th className="p-2 text-left">CV</th>
                                <th className="p-2 text-left">Experience</th>
                                <th className="p-2 text-left">Posts</th>
                                <th className="p-2 text-left">Jobs</th>
                                <th className="p-2 text-left">Comments</th>
                                <th className="p-2 text-left">Friends</th>
                                <th className="p-2 text-left">Likes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user._id} className="border-t">

                                    {/* Image */}
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

                                    {/* Name */}
                                    <td className="p-2">
                                        {user.firstName} {user.lastName}
                                    </td>
                                    {/* Email */}
                                    <td className="p-2">{user.email}</td>

                                    {/* Phone */}
                                    <td className="p-2">{user.phone}</td>

                                    {/* CV */}
                                    <td className="p-2">
                                        {user.cv ? <a href={user.cv} target="_blank" className="text-blue-600">Download CV</a> : 'N/A'}
                                    </td>

                                    {/* experience */}
                                    <td className="p-2">{user.experience || 'N/A'}</td>

                                    {/* Posts */}
                                    <td className="p-2">
                                        <ul className="p-3 border-gray-300 rounded-xl border max-h-[200px] overflow-y-auto">
                                            {(user.posts || []).map(post => (
                                                <li key={post._id} className="hover:bg-gray-200">
                                                    <strong>ID:</strong> {post._id}<br />
                                                    <strong>Text:</strong> {post.text}<br />
                                                    <hr/>
                                                </li>
                                            ))}
                                        </ul>
                                    </td>

                                    {/* Jobs */}
                                    <td className="p-2">
                                        <ul className="p-3 border-gray-300 rounded-xl border max-h-[200px] overflow-y-auto">
                                            {(user.listings || []).map(listing => (
                                                <li key={listing._id} className="hover:bg-gray-200">
                                                    <strong>ID:</strong> {listing._id}<br />
                                                    <strong>Title:</strong> {listing.title}
                                                    <hr/>
                                                </li>
                                            ))}
                                        </ul>
                                    </td>

                                    {/* Comments */}
                                    <td className="p-2">
                                    <ul className="p-3 border-gray-300 rounded-xl border max-h-[200px] overflow-y-auto">
                                        {(user.comments || []).map(comment => (
                                            <div key={comment._id} className="hover:bg-gray-200">
                                                {(posts || []).map(post => (
                                                    post.comments.some(c => c._id === comment._id) && (
                                                        <li key={post._id}>Post ID: {post._id}</li>
                                                    )
                                                ))}
                                                <li key={comment._id}>Text: {comment.text}</li>
                                                <hr/>
                                            </div>
                                        ))}
                                        </ul>
                                    </td>

                                    {/* Friends */}
                                    <td className="p-2">
                                        <ul className="p-3 border-gray-300 rounded-xl border max-h-[200px] overflow-y-auto">
                                            {(user.friends || []).map(friend => (
                                                <li key={friend._id} className="hover:bg-gray-200">
                                                    {friend.firstName} {friend.lastName}
                                                    <hr/>
                                                </li>
                                            ))}
                                        </ul>
                                    </td>

                                    {/* Likes */}
                                    <td className="p-2">
                                        <ul className="p-3 border-gray-300 rounded-xl border max-h-[200px] overflow-y-auto">
                                        {(posts || []).map(post => (
                                            <li key={post._id} className="hover:bg-gray-200">
                                            <ul>
                                                {post.likes.includes(user._id) && (
                                                    <li key={post._id}>Post ID: {post._id}
                                                        <hr/>
                                                    </li>
                                                )}
                                            </ul>
                                        </li>
                                        ))}
                                        </ul>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <hr className=" mt-4 mb-4"/>
                    <div className="flex space-x-2 justify-end">
                        <Button size="sm" color="primary" onPress={downloadJson}>Download JSON</Button>
                        <Button size="sm" color="primary" onPress={downloadXml}>Download XML</Button>
                    </div>
                    </>
                )}
            </div>
        </div>
    );
}
