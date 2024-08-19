"use client";

import { Briefcase, HomeIcon, MessageSquare, SearchIcon, UsersIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect } from 'react';
import { Avatar } from "@nextui-org/avatar";
import { Button } from "@nextui-org/react";
import { signOut } from "next-auth/react";
import { useRouter } from 'next/navigation';
import {cn} from "@/lib/utils";

export default function Header() {
    const { data: session, status } = useSession();
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const router = useRouter();

    const [path, setPath] = useState('');
    useEffect(() => {
        setPath(window.location.pathname);
    }, [router]);

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
        <div className="flex items-center justify-between px-2 py-1 bg-white shadow-md shadow-gray-400 ">
            <div className="flex items-center spaxe-x-2">
                <Image
                    className="rounded-md"
                    src="/favicon.ico"
                    width={40}
                    height={40}
                    alt="logo"
                />

                {/* <form className="flex-1 flex items-center bg-gray-200 rounded-md ml-2 px-2 max-w-10">
                    <SearchIcon className="h-4 text-gray-500"/>
                    <input 
                        type="text"
                        placeholder="Search"
                        className="bg-transparent flex-1 outline-none text-sm"
                    />
                </form> */}
            </div>
            
            <div className="flex-1 flex items-center space-x-2 justify-center">
                <Link href="/feed" title="Home Page" >
                    <HomeIcon className={cn("h-5", path === '/feed' && "text-black fill-blue-500 ")} />
                </Link>

                <Link href="/network" title="Network">
                    <UsersIcon className={cn("h-5", path === '/network' && "text-black fill-blue-500")} />
                </Link>

                <Link href="/jobs" title="Jobs">
                    <Briefcase className={cn("h-5", path === '/jobs' && "text-black fill-blue-500")} />
                </Link>

                <Link href="/communication" title="Communication">
                    <MessageSquare className={cn("h-5", path === '/communication' && "text-black fill-blue-500")} />
                </Link>
            </div>

            <div className="flex relative">
                
                <div onClick={toggleDropdown} className="cursor-pointer">
                {session?.user?.profileImage ? (
                    <Avatar
                        isBordered
                        color=""
                        size="sm"
                        radius="full"
                        src={session?.user?.profileImage}
                    />
                ):(
                    <Avatar
                        isBordered
                        color=""
                        size="sm"
                        radius="full"
                        name={session?.user?.firstName.charAt(0) + session?.user?.lastName.charAt(0)}
                    />
                )}
                </div>

                {dropdownVisible && (
                    <div className="absolute right-2 mt-7 w-40 bg-white border border-gray-300 rounded shadow-xl">
                        <Link href="/userinfo" legacyBehavior>
                            <a className="block px-4 py-2 text-gray-800 hover:bg-gray-300">Profile Information</a>
                        </Link>
                        <Link href=""legacyBehavior>
                            <a className="block px-4 py-2 text-gray-800 hover:bg-gray-300">Profile Settings</a>
                        </Link>
                        <a className="flex px-4 py-2 justify-center">
                            <Button
                                onClick={() => signOut()}
                                color="danger"
                                size="sm"
                                radius="sm"
                                variant="ghost"
                                className=" w-fit text-sm mx-auto"
                            >
                                Log Out
                            </Button>
                        </a>
                    </div>
                )}

            </div>
        </div>
    );
};