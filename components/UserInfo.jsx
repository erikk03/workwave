"use client";

import { useState, useEffect } from 'react';
import { Avatar, Button } from '@nextui-org/react';
import { redirect } from 'next/navigation';
import { useSession } from "next-auth/react";
import { Download, Pencil, Send } from 'lucide-react';
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure} from "@nextui-org/react";
import Communication from './Communication';


export default function UserProfile({ userId, initialUser }) {
	const [profileUser, setUser] = useState(initialUser);
	const [isEditing, setIsEditing] = useState(false);
	const [conversations, setConversations] = useState([]);
	const [openConversation, setOpenConversation] = useState(false);
	const [convId, setConvId] = useState(null);
	const { data: session, status } = useSession();
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
	const handleEditClick = () => setIsEditing(true);

	const sessionUser = session?.user;
	const sessionUserId = sessionUser?.userId;
	const isProfileOwner = userId === sessionUserId;

	const getFieldVisibility = (field) => {
		if(!profileUser.visibilitySettings)
			return isProfileOwner;

		return isProfileOwner || profileUser?.visibilitySettings[field];
	};

	useEffect(() => {
		fetchConversations();
	}, []);

	const fetchConversations = async () => {
		try {
		  const response = await fetch("/api/conversations");
		  if (!response.ok) throw new Error("Failed to fetch conversations");
		  const data = await response.json();
		  setConversations(data);
		} catch (error) {
		  console.error("Error fetching conversations:", error);
		}
	};

	const popUpConversation = async () => {
        try {
	
			// Find the conversation with the matching participants
			const conversation = conversations.find(conv => 
				conv.participants.some(participant => participant._id === profileUser._id)
			);

			if (conversation) {
				setConvId(conversation._id.toString());
				setOpenConversation(true);
				onOpen();
			} else {
				console.log("No matching conversation found.");
			}
        } catch (error) {
            console.error(error.message);
        }
    };

  	return (
    <div className="col-span-full md:col-span-6 md:max-w-2xl xl:col-span-4 xl:max-w-5xl sm:max-w-md mx-auto w-full">
      	<div className="mt-5 bg-white rounded-xl border">
		  	<div className='mt-2 mr-2 flex flex-col items-end'>
				{isProfileOwner && (
					<Button onClick={handleEditClick} color="default" variant="light" size="sm">
					Edit Profile
					<Pencil size={15}/>
					</Button>
				)}
          	</div>

			  <div className='mt-2 mr-2 flex flex-col items-end'> {/* Change to absolute positioning */}
				{!isProfileOwner && (
					<Button onClick={() => popUpConversation()}
					color="default" 
					variant="light" 
					size="sm">
					Send A Message
					<Send size={15}/>
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

			{getFieldVisibility('cv') && profileUser.cv && (
				<div className='mb-2 mr-2 flex flex-col items-end'>
					<Button
						color="default"
						variant="light"
						size="sm"
						onClick={() => window.open(profileUser.cv, '_blank')}
					>
						Download CV
						<Download size={15}/>
					</Button>
				</div>
			)}

			{isEditing && (
				redirect(`/userinfo/${userId}/edit`)
			)}

		</div>

		{/* Position and Industry */}
		{(getFieldVisibility('position') || getFieldVisibility('industry')) && (
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
		)}

		{/* Experience */}
		{getFieldVisibility('experience') && (
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
		)}

		{/* Education */}
		{getFieldVisibility('education') && (
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
		)}

		{/* Skills */}
		{getFieldVisibility('skills') && (
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
		)}

		{/* Modal for displaying a post */}
		{openConversation && (
			<Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="opaque" placement="center" size="full">
				<ModalContent>
					<ModalHeader></ModalHeader>
					<ModalBody>
						<div>
							<Communication session={session} convId={convId}/>
						</div>
					</ModalBody>
					<ModalFooter></ModalFooter>
				</ModalContent>
			</Modal>
		)}
    </div>
  );
}

