"use client";

import { useState, useEffect } from 'react';
import { Button, Input, Textarea, Switch } from '@nextui-org/react';
import { redirect } from 'next/navigation';
import { useSession } from "next-auth/react";
import updateUserInfo from "@/actions/updateUserInfo";
import { Lock, Globe } from "lucide-react";
import bcrypt from "bcryptjs";

export default function UserProfile({ userId, initialUser }) {
    const { data: session, status } = useSession();

    const [user, setUser] = useState(initialUser);
    const [isEditing, setIsEditing] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        setFormData({
            email: user.email,
            password: user.password,
            confirmPassword: '',
        });
    }, [user]);

    const handleCancelClick = () => setIsEditing(false);

    const handleChange = async (e) => {
        const { name, value } = e.target;

        setFormData((prevState) => ({ ...prevState, [name]: value }));

    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.email.trim()) newErrors.email = 'Email is required';

        // Validate email and password
        const emailRegex = /^[A-Za-z0-9._%+-]+@(gmail|yahoo|di.uoa|uoa)\.(com|gr)$/;
        if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Invalid email address';
        }

        const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9]).{8,}$/;
        if (!passwordRegex.test(formData.password)) {
            let error = "Password must have:\n";
            let conditions = [];
            if (!/(?=.*[A-Z])/.test(password)) conditions.push(" - at least one uppercase letter");
            if (!/(?=.*[!@#$&*])/.test(password)) conditions.push(" - at least one symbol");
            if (!/(?=.*[0-9])/.test(password)) conditions.push(" - at least one number");
            if (password.length < 8) conditions.push(" - at least 8 characters");
            
            newErrors.password = error + conditions.join("\n");
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const formDataToSend = new FormData();
        for (const [key, value] of Object.entries(formData)) {
            if(key === 'password') {
                const hashedPassword = await bcrypt.hash(value, 10);
                formDataToSend.append(key, hashedPassword);
            
            }else{
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

    if (!isEditing) {
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
                            label="Email"
                            type="text"
                            name="email"
                            variant='bordered'
                            value={formData.email}
                            onChange={handleChange}
                            isRequired
                        />
                    </div>
                    {errors.email && <p className="text-red-500 ml-2">{errors.email}</p>}

                    <div className='flex items-center space-x-2 ml-2 mr-2 mt-2'>
                        <Input
                            label="Change password"
                            type="password"
                            name="password"
                            variant='bordered'
                            onChange={handleChange}
                            isRequired
                        />
                    </div>
                    {errors.password && <p className="text-red-500 ml-2">{errors.password}</p>}

                    <div className='flex items-center space-x-2 ml-2 mr-2 mt-2'>
                        <Input
                            label="Confirm New Password"
                            type="password"
                            name="confirmPassword"
                            variant='bordered'
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            isRequired
                        />
                    </div>  
                    {errors.confirmPassword && <p className="text-red-500 ml-2">{errors.confirmPassword}</p>}

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
