"use client";

import { useState, useEffect, useRef } from 'react';
import { Button, Input, Textarea } from '@nextui-org/react';
import { redirect } from 'next/navigation';
import { useSession } from "next-auth/react";
import updateUserInfo from "@/actions/updateUserInfo";

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

	const handleSubmit = async (e) => {
		e.preventDefault();
		const formDataToSend = new FormData();

		for (const [key, value] of Object.entries(formData)) {
			if (key === 'cv' && value instanceof File) {
				formDataToSend.append(key, value, value.name);
				console.log('CV file:', value.name, value.type, value.size);
			} else {
				formDataToSend.append(key, value);
			}
		}

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
		<div className="col-span-full md:col-span-6 md:max-w-2xl xl:col-span-4 xl:max-w-5xl sm:max-w-md mx-auto w-full">
			<div className="mt-5 bg-white rounded-xl border border-black">
				<form
				onSubmit={handleSubmit}
				className="mb-2 rounded-xl space-y-4 bg-transparent"
				>
					<Input
					label="First Name"
					type="text"
					name="firstName"
					value={formData.firstName}
					onChange={handleChange}
					isRequired
					/>
					<Input
					label="Last Name"
					type="text"
					name="lastName"
					value={formData.lastName}
					onChange={handleChange}
					isRequired
					/>
					<Input
					label="Email"
					type="text"
					name="email"
					value={formData.email}
					onChange={handleChange}
					isRequired
					/>

					<Input
					label="Phone"
					type="text"
					name="phone"
					value={formData.phone}
					onChange={handleChange}
					isRequired
					/>

					<Input
					label="Position"
					type="text"
					name="position"
					value={formData.position}
					onChange={handleChange}
					/>
					<Input
					label="Industry"
					type="text"
					name="industry"
					value={formData.industry}
					onChange={handleChange}
					/>
					<Textarea
					label="Experience"
					type="text"
					name="experience"
					value={formData.experience}
					onChange={handleChange}
					/>
					<Textarea
					label="Education"
					type="text"
					name="education"
					value={formData.education}
					onChange={handleChange}
					/>
					<Textarea
					label="Skills"
					type="text"
					name="skills"
					value={formData.skills}
					onChange={handleChange}
					/>

					<Input
					label="Upload CV"
					name="cv"
					type="file"
					accept=".pdf"
					onChange={handleChange}
					/>

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