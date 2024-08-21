// app/userinfo/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Button } from "@nextui-org/react";

const UserListPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch('/api/users'); // Call your API to get all users
      const data = await response.json();
      setUsers(data);
    };
    fetchUsers();
  }, []);

  const handleSearch = async () => {
    const response = await fetch('/api/users/selected', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userIds: users.filter(user => user.firstName.toLowerCase().includes(searchQuery.toLowerCase())).map(user => user._id) }),
    });
    const data = await response.json();
    setUsers(data);
  };

  return (
    <div className="grid place-items-center h-screen">
      <div className="shadow-2xl p-5 rounded-lg border-t-4 border-blue-900 bg-zinc-300/10 flex flex-col gap-3 my-6">
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4"
        />
        <Button onClick={handleSearch} color="primary" size="sm">Search</Button>
        <ul className="mt-4">
          {users.map(user => (
            <li key={user._id}>
              <a href={`/userinfo/${user._id}`} className="text-blue-600">{user.firstName}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UserListPage;
