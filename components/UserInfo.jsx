"use client";

import { useState } from 'react';
import { Avatar, Button } from '@nextui-org/react';
import { redirect } from 'next/navigation';
import { useSession } from "next-auth/react";

export default function UserProfile({ userId, initialUser }) {
	const [profileUser, setUser] = useState(initialUser);
	const [isEditing, setIsEditing] = useState(false);
	const { data: session, status } = useSession();

	const handleEditClick = () => setIsEditing(true);

	const sessionUser = session?.user;
	const sessionUserId = sessionUser?.userId;

  	return (
    <div className="col-span-full md:col-span-6 md:max-w-2xl xl:col-span-4 xl:max-w-5xl sm:max-w-md mx-auto w-full">
      	<div className="mt-5 bg-white rounded-xl border">
		  	<div className='mt-2 mr-2 flex flex-col items-end'>
				{(userId === sessionUserId) && (
					<Button onClick={handleEditClick} color="default" variant="light" size="sm">
					Edit Profile
					</Button>
				)}
          	</div>

			<div className='mt-5 flex flex-col items-center'>
				{profileUser.profileImage ? (
					<Avatar
					isBordered
					color="primary"
					size="lg"
					radius="full"
					className="w-24 h-24 mx-auto mb-4"
					src={profileUser.profileImage}
					/>
				) : (
					<Avatar
					isBordered
					color=""
					size="lg"
					radius="full"
					className="w-24 h-24 mx-auto mb-4"
					name={profileUser.firstName.charAt(0) + profileUser.lastName.charAt(0)}
					/>
				)}
				<div>
					<span className="font-bold text-3xl">
						{profileUser.firstName} {profileUser.lastName}
					</span>
				</div>
				<div>
					<span className=" text-lg">
						{profileUser.email}
					</span>
				</div>
			</div>

			<div className='mb-2 mr-2 flex flex-col items-end'>
				<Button color="default" variant="light" size="sm">
					Download CV
				</Button>
			</div>

			{isEditing && (
				redirect(`/userinfo/${userId}/edit`)
			)}

		</div>

		{/* Position and Industry */}
		<div className="mt-5 pb-10 bg-white rounded-xl border">
			<div className='mt-5 flex flex-col items-center'>
				<div>
					<span className="font-bold text-3xl">
						Current Position and Industry
					</span>
				</div>
				<div>
					<span className="text-lg">
						{profileUser.position || 'N/A'} in {profileUser.industry || 'N/A'}
					</span>
				</div>
			</div>
		</div>

		{/* Experience */}
		<div className="mt-5 pb-10 bg-white rounded-xl border">
			<div className='mt-5 flex flex-col items-center'>
				<div>
					<span className="font-bold text-3xl">
						Professional Experience
					</span>
				</div>
				<div>
					<span className="text-lg">
						{profileUser.experience || 'N/A'}
					</span>
				</div>
			</div>
		</div>

		{/* Education */}
		<div className="mt-5 pb-10 bg-white rounded-xl border">
			<div className='mt-5 flex flex-col items-center'>
				<div>
					<span className="font-bold text-3xl">
						Education
					</span>
				</div>
				<div>
					<span className="text-lg">
						{profileUser.education || 'N/A'}
					</span>
				</div>
			</div>
		</div>

		{/* Skills */}
		<div className="mt-5 mb-5 space-y-1 pb-10 bg-white rounded-xl border">
			<div className='mt-5 flex flex-col items-center'>
				<div>
					<span className="font-bold text-3xl">
						Skills
					</span>
				</div>
				<div>
					<span className="text-lg">
						{profileUser.skills || 'N/A'}
					</span>
				</div>
			</div>
		</div>
    </div>
  );
}

