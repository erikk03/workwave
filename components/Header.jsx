"use client"

import { Briefcase, HomeIcon, MessageSquare, SearchIcon, UsersIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from 'react';

export default function Header() {
    const { data: session, status } = useSession();
    const [dropdownVisible, setDropdownVisible] = useState(false);

    const toggleDropdown = () => {
        setDropdownVisible(!dropdownVisible);
    };

    if (status === "loading") {
        return <div>Loading...</div>;
    }

    if (status === "unauthenticated") {
        return <div>Please log in to view your profile.</div>;
    }

    return (
        <div className="flex items-center p-2 mx-auto">
            <Image
                className="rounded-lg"
                src="/favicon.ico"
                width={40}
                height={40}
                alt="logo"
            />

            <div className="flex-1">
                <form className="flex items-center bg-gray-200 rounded-md mx-2 max-w-96">
                    <SearchIcon className="h-4 text-gray-500"/>
                    <input 
                        type="text"
                        placeholder="Search"
                        className="bg-transparent flex-1 outline-none"
                    />
                </form>
            </div>
        
            <div className="flex items-center space-x-3 px-3">
                <Link href="/feed" className="icon">
                    <HomeIcon className="h-5" />
                </Link>

                <Link href="" className="icon hidden md:flex">
                    <UsersIcon className="h-5" />
                </Link>

                <Link href="" className="icon hidden md:flex">
                    <Briefcase className="h-5" />
                </Link>

                <Link href="" className="icon hidden md:flex">
                    <MessageSquare className="h-5" />
                </Link>

                <div className="relative">
                    
                        <div onClick={toggleDropdown} className="cursor-pointer">
                        {session?.user?.profileImage && (
                            <Image
                                className="rounded-full"
                                src={session.user.profileImage}
                                width={30}
                                height={30}
                                alt="profile"
                            />
                        )}
                    </div>

                    {dropdownVisible && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg">
                            <Link href="/userinfo" legacyBehavior>
                                <a className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Profile Information</a>
                            </Link>
                            <Link href=""legacyBehavior>
                                <a className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Profile Settings</a>
                            </Link>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};