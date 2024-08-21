"use client";

import { useState, useEffect } from 'react';
import { Button, Input, Textarea } from '@nextui-org/react';
import { redirect } from 'next/navigation';

export default function UserProfile({ userId, initialUser }) {
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
    });
  }, [user]);

  const [cvFile, setCvFile] = useState(null);

  const handleCancelClick = () => setIsEditing(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleCvChange = (e) => {
    setCvFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
	const response = await fetch(`/api/users/${userId}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ ...formData, cv: cvFile }),
    });

	if (response.ok) {
		const updatedUser = await response.json();
		setUser(updatedUser); // Update local state with new data
		setIsEditing(false);
	} else {
		// Handle error response
		console.error('Failed to update user');
	}
  };

  if(!isEditing){
    redirect(`/userinfo/${userId}`);
  }

  return (
    <div className="col-span-full md:col-span-6 md:max-w-2xl xl:col-span-4 xl:max-w-5xl sm:max-w-md mx-auto w-full">
      	<div className="mt-5 bg-white rounded-xl border">
			<form onSubmit={handleSubmit} className="mb-2 bg-gray-200 rounded-xl space-y-4">
				<Input
				label="First Name"
				name="firstName"
				value={formData.firstName}
				onChange={handleChange}
				required
				/>
				<Input
				label="Last Name"
				name="lastName"
				value={formData.lastName}
				onChange={handleChange}
				required
				/>
				<Input
				label="Email"
				name="email"
				value={formData.email}
				onChange={handleChange}
				required
				/>
				<Input
				label="Phone"
				name="phone"
				value={formData.phone}
				onChange={handleChange}
				/>
				<Input
				label="Position"
				name="position"
				value={formData.position}
				onChange={handleChange}
				/>
				<Input
				label="Industry"
				name="industry"
				value={formData.industry}
				onChange={handleChange}
				/>
				<Textarea
				label="Experience"
				name="experience"
				value={formData.experience}
				onChange={handleChange}
				/>
				<Textarea
				label="Education"
				name="education"
				value={formData.education}
				onChange={handleChange}
				/>
				<Textarea
				label="Skills"
				name="skills"
				value={formData.skills}
				onChange={handleChange}
				/>

				<Input
				label="Upload CV"
				type="file"
				name="cv"
				accept=".pdf"
				onChange={handleCvChange}
				/>

				<div className='mt-2 mr-2 flex flex-col items-center'>
					<Button className="mt-2" type="submit" color="success" variant='ghost' size="sm">
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