"use client";

import { Avatar } from '@nextui-org/react';
import { redirect } from 'next/navigation';
import { useSession } from "next-auth/react";
import Link from 'next/link';

export default function UserProfile() {
	const { data: session, status } = useSession();
	if (status === "loading") {
        return <div>Loading...</div>;
    }

    if (status === "unauthenticated") {
        return <div>Please log in to view your profile.</div>;
    }

	const user = session?.user;

	if (!user) {
		redirect('/');
	}
	
  	return (
    <div className="col-span-full md:col-span-6 md:max-w-2xl xl:col-span-4 xl:max-w-5xl sm:max-w-md mx-auto w-full">
      	<div className="bg-gray-100 rounded-xl border">

			<div className='mt-2 flex flex-col items-center'>
			<Link href={`/userinfo/${session?.user?.userId}`} legacyBehavior>
				{user?.profileImage ? (
					<Avatar
					isBordered
					color="primary"
					size="md"
					radius="full"
					className="w-24 h-24 mx-auto mb-4 cursor-pointer"
					src={user?.profileImage}
					/>
				) : (
					<Avatar
					isBordered
					color=""
					size="md"
					radius="full"
					className="w-24 h-24 mx-auto mb-4 cursor-pointer"
					name={user?.firstName.charAt(0) + user?.lastName.charAt(0)}
					/>
				)}
			</Link>
				<div>
					<span className="font-bold text-lg">
						{user?.firstName} {user?.lastName}
					</span>
				</div>
				<div>
					<span className=" text-sm text-gray-600">
						{user?.email}
					</span>
				</div>
				<div>
					<span className="text-sm text-gray-600">
						{user?.position || ''} { user?.industry || ''}
					</span>
				</div>
			</div>
		</div>
    </div>
  );
}

