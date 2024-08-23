"use client";

import { useState, useEffect } from 'react';
import { Button, Input, Textarea, Switch } from '@nextui-org/react';
import { redirect } from 'next/navigation';
import { useSession } from "next-auth/react";
import updateUserInfo from "@/actions/updateUserInfo";
import {Lock, Globe} from "lucide-react"

export default function UserProfile({ userId, initialUser }) {
	const { data: session, status } = useSession();

	const [user, setUser] = useState(initialUser);
	const [isEditing, setIsEditing] = useState(true);
	const [formData, setFormData] = useState({
	firstName: '',
	lastName: '',
	email: '',
	phone: '',
	position: '',
	industry: '',
	experience: '',
	education: '',
	skills: '',
	cv: null,
	visibilitySettings: {
		firstName: true,
		lastName: true,
		email: true,
		phone: true,
		position: true,
		industry: true,
		experience: true,
		education: true,
		skills: true,
		cv: true,
		},
	});

	useEffect(() => {
	setFormData({
		firstName: user.firstName,
		lastName: user.lastName,
		email: user.email,
		phone: user.phone,
		position: user.position,
		industry: user.industry,
		experience: user.experience,
		education: user.education,
		skills: user.skills,
		cv: user.cv,
		visibilitySettings: user.visibilitySettings,
	});
	}, [user]);

	const handleCancelClick = () => setIsEditing(false);

	const handleChange = (e) => {
		const { name, value, files } = e.target;
		if (name === 'cv') {
		  setFormData((prevState) => ({ ...prevState, [name]: files[0] }));
		} else {
		  setFormData((prevState) => ({ ...prevState, [name]: value }));
		}
	};

	const handleVisibilityChange = (field, selected) => {
		setFormData((prevState) => ({
		  ...prevState,
		  visibilitySettings: {
			...prevState.visibilitySettings,
			[field]: selected,
		  },
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const formDataToSend = new FormData();

		for (const [key, value] of Object.entries(formData)) {
			if (key === 'cv' && value instanceof File) {
				formDataToSend.append(key, value, value.name);
			} else {
				formDataToSend.append(key, value);
			}
		}

		// Add visibility settings to form data
		Object.keys(formData.visibilitySettings).forEach(field => {
			formDataToSend.append(`visibilitySettings.${field}`, formData.visibilitySettings[field]);
		});

		try {
			const response = await updateUserInfo(formDataToSend, session);
			const updatedUser = await response.json();
			setUser(updatedUser);
			setIsEditing(false);
		} catch (error) {
			console.log('Error updating user: ', error.message);
		}
	};


	if(!isEditing){
		redirect(`/userinfo/${userId}`);
	}

	return (
		<div className="col-span-full md:col-span-6 md:max-w-2xl xl:col-span-4 xl:max-w-5xl sm:max-w-xl mx-auto w-full">
			<div className="mt-5 mb-5 rounded-xl border-2 border-black">
				<form
				onSubmit={handleSubmit}
				className="mb-2 rounded-xl space-y-4 bg-transparent items-center"
				>
					<div className='flex items-center space-x-2 ml-2 mr-2 mt-2'>
						<Input
							label="First Name"
							type="text"
							name="firstName"
							variant='bordered'
							value={formData.firstName}
							onChange={handleChange}
							isRequired
						/>

						<Switch
							isDisabled
							size="sm"
							color="success"
							startContent={<Globe />}
							endContent={<Lock />}
							isSelected={formData.visibilitySettings.firstName}
							onValueChange={(selected) => handleVisibilityChange('firstName', selected)}
						>
							<p className="text-small text-default-500">{formData.visibilitySettings.firstName ? "public" : "private"}</p>
						</Switch>
					</div>

					<div className='flex items-center space-x-2 ml-2 mr-2 mt-2'>
						<Input
							label="Last Name"
							type="text"
							name="lastName"
							variant='bordered'
							value={formData.lastName}
							onChange={handleChange}
							isRequired
						/>

						<Switch
							isDisabled
							size="sm"
							color="success"
							startContent={<Globe />}
							endContent={<Lock />}
							isSelected={formData.visibilitySettings.lastName}
							onValueChange={(selected) => handleVisibilityChange("lastName", selected)}
						>
							<p className="text-small text-default-500">{formData.visibilitySettings.lastName ? "public" : "private"}</p>
						</Switch>
					</div>

					<div className='flex items-center space-x-2 ml-2 mr-2 mt-2'>
						<Input
							isDisabled
							label="Email"
							type="text"
							name="email"
							variant='bordered'
							value={formData.email}
							onChange={handleChange}
							isRequired
						/>

						<Switch
							isDisabled
							size="sm"
							color="success"
							startContent={<Globe />}
							endContent={<Lock />}
							isSelected={formData.visibilitySettings.email}
							onValueChange={(selected) => handleVisibilityChange("email", selected)}
						>
							<p className="text-small text-default-500">{formData.visibilitySettings.email ? "public" : "private"}</p>
						</Switch>
					</div>

					<div className='flex items-center space-x-2 ml-2 mr-2 mt-2'>
						<Input
							label="Phone"
							type="text"
							name="phone"
							variant='bordered'
							value={formData.phone}
							onChange={handleChange}
							isRequired
						/>
						<Switch
							size="sm"
							color="success"
							startContent={<Globe />}
							endContent={<Lock />}
							isSelected={formData.visibilitySettings.phone}
							onValueChange={(selected) => handleVisibilityChange("phone", selected)}
						>
							<p className="text-small text-default-500">{formData.visibilitySettings.phone ? "public" : "private"}</p>
						</Switch>
					</div>

					<div className='flex items-center space-x-2 ml-2 mr-2 mt-2'>
						<Input
						label="Position"
						type="text"
						name="position"
						variant='bordered'
						value={formData.position}
						onChange={handleChange}
						/>

						<Switch
							size="sm"
							color="success"
							startContent={<Globe />}
							endContent={<Lock />}
							isSelected={formData.visibilitySettings.position}
							onValueChange={(selected) => handleVisibilityChange("position", selected)}
						>
							<p className="text-small text-default-500">{formData.visibilitySettings.position ? "public" : "private"}</p>
						</Switch>
					</div>

					<div className='flex items-center space-x-2 ml-2 mr-2 mt-2'>
						<Input
						label="Industry"
						type="text"
						name="industry"
						variant='bordered'
						value={formData.industry}
						onChange={handleChange}
						/>
						<Switch
							size="sm"
							color="success"
							startContent={<Globe />}
							endContent={<Lock />}
							isSelected={formData.visibilitySettings.industry}
							onValueChange={(selected) => handleVisibilityChange("industry", selected)}
						>
							<p className="text-small text-default-500">{formData.visibilitySettings.industry ? "public" : "private"}</p>
						</Switch>
					</div>

					<div className='flex items-center space-x-2 ml-2 mr-2 mt-2'>
						<Textarea
						label="Experience"
						type="text"
						name="experience"
						variant='bordered'
						value={formData.experience}
						onChange={handleChange}
						/>

						<Switch
							size="sm"
							color="success"
							startContent={<Globe />}
							endContent={<Lock />}
							isSelected={formData.visibilitySettings.experience}
							onValueChange={(selected) => handleVisibilityChange("experience", selected)}
						>
							<p className="text-small text-default-500">{formData.visibilitySettings.experience ? "public" : "private"}</p>
						</Switch>
					</div>

					<div className='flex items-center space-x-2 ml-2 mr-2 mt-2'>
						<Textarea
						label="Education"
						type="text"
						name="education"
						variant='bordered'
						value={formData.education}
						onChange={handleChange}
						/>

						<Switch
							size="sm"
							color="success"
							startContent={<Globe />}
							endContent={<Lock />}
							isSelected={formData.visibilitySettings.education}
							onValueChange={(selected) => handleVisibilityChange("education", selected)}
						>
							<p className="text-small text-default-500">{formData.visibilitySettings.education ? "public" : "private"}</p>
						</Switch>
					</div>

					<div className='flex items-center space-x-2 ml-2 mr-2 mt-2'>
						<Textarea
						label="Skills"
						type="text"
						name="skills"
						variant='bordered'
						value={formData.skills}
						onChange={handleChange}
						/>

						<Switch
							size="sm"
							color="success"
							startContent={<Globe />}
							endContent={<Lock />}
							isSelected={formData.visibilitySettings.skills}
							onValueChange={(selected) => handleVisibilityChange("skills", selected)}
						>
							<p className="text-small text-default-500">{formData.visibilitySettings.skills ? "public" : "private"}</p>
						</Switch>
					</div>

					<div className='flex items-center space-x-2 ml-2 mr-2 mt-2'>
						<Input
							label="Upload CV"
							name="cv"
							variant='bordered'
							type="file"
							accept=".pdf"
							onChange={handleChange}
						/>

						<Switch
							size="sm"
							color="success"
							startContent={<Globe />}
							endContent={<Lock />}
							isSelected={formData.visibilitySettings.cv}
							onValueChange={(selected) => handleVisibilityChange("cv", selected)}
						>
							<p className="text-small text-default-500">{formData.visibilitySettings.cv ? "public" : "private"}</p>
						</Switch>
					</div>

					<div className='mt-2 mr-2 flex flex-col items-center'>
						<Button
							type="submit"
							color="success"
							size="sm"
							variant='ghost'
							className="mt-2"
						>
						Save Changes
						</Button>

						<Button className="mt-4 mb-4" onClick={handleCancelClick} color="danger" variant='ghost' size="sm">
						Cancel
						</Button>
					</div>
				</form>

			</div>
		</div>
	);
}