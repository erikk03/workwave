'use client';

import Link from 'next/link';
import {useState} from 'react';

export default function SignUpForm() {
    const [FirstName, setFirstName] = useState("");
    const [LastName, setLastName] = useState("");
    const [Email, setEmail] = useState("");
    const [Phone, setPhone] = useState("");
    const [Password, setPassword] = useState("");
    const [ConfirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if(!FirstName || !LastName || !Email || !Phone || !Password || !ConfirmPassword) {
            setError("Please fill all the fields");
            return;
        }
    
        try {
            const res = await fetch("api/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    FirstName, 
                    LastName,
                    Email,
                    Phone,
                    Password,
                    ConfirmPassword
                }),
            });

            if(res.ok) {
                const form = e.target;
                form.reset();
            }
            else {
                console.log("Error during sign up");
            }
            
        }catch (error) {
            console.log("Error while signing up", error); 
        }
    };
    
    return(
        <div className="grid place-items-center h-screen">
            <div className="shadow-lg p-5 rounded-lg border-t-4 border-green-400">
                <h1 className="text-center text-xl font-bold my-4">Create an account!</h1>

                <form onSubmit ={handleSubmit} className="flex flex-col gap-3">
                    <input onChange={e => setFirstName(e.target.value)} type="text" placeholder="First Name" />
                    <input onChange={e => setLastName(e.target.value)} type="text" placeholder="Last Name" />
                    <input onChange={e => setEmail(e.target.value)} type="text" placeholder="Email" />
                    <input onChange={e => setPhone(e.target.value)} type="text" placeholder="Phone Number" />
                    <input onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" />
                    <input onChange={e => setConfirmPassword(e.target.value)} type="password" placeholder="Confirm Password" />
                    
                    <button className="bg-green-400 text-white py-2 rounded-lg">
                        Sign Up
                    </button>

                    { error && (
                    <div className="bg-red-500 text-white w-fit text-sm py-1 px-3 rounded-md mt-2">
                        {error}
                    </div>
                    )}

                    <Link className="text-sm mt-3 text-right" href={"/signin"}>
                        Already have an accout? &nbsp;
                        <span className="underline">SignIn</span>
                    </Link>
                </form>
            </div>        
        </div>
    );
}