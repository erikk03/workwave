'use client';

import Link from 'next/link';
import {useState} from 'react';

import { useRouter } from 'next/navigation';

export default function SignUpForm() {
    const [FirstName, setFirstName] = useState("");
    const [LastName, setLastName] = useState("");
    const [Email, setEmail] = useState("");
    const [Phone, setPhone] = useState("");
    const [Password, setPassword] = useState("");
    const [ConfirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if(!FirstName || !LastName || !Email || !Phone || !Password || !ConfirmPassword) {
            setError("Please fill all the fields");
            return;
        }
    
        
        const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9]).{8,}$/;

        if (!passwordRegex.test(Password)) {
            let error = "Password must ";
            if (!/(?=.*[A-Z])/.test(Password)) {
                error += "have at least one uppercase letter";
            }
            if (!/(?=.*[!@#$&*])/.test(Password)) {
                error += "have at least one symbol";
            }
            if (!/(?=.*[0-9])/.test(Password)) {
                error += "have at least one number";
            }
            if (Password.length < 8) {
                error += "be more than 8 characters";
            }
            setError(error);
            return;
        }

        if (Password !== ConfirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (Phone.length !== 10) {
            setError("Phone number must be 10 digits");
            return;
        }
        
        const emailRegex = /^[A-Za-z0-9._%+-]+@(gmail|yahoo|di.uoa|uoa)\.(com|gr)$/;
        if (!emailRegex.test(Email)) {
            setError("Invalid email format");
            return;
        }
        
        try {

            const resUserExist = await fetch("api/userExists", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ Email }),
            });

            const { user } = await resUserExist.json();

            if(user) {
                setError("User already exists");
                return;
            }

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
                router.push("/signin"); //redirect to signin page after successful signup
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
            <div className="shadow-2xl p-5 rounded-lg border-t-4 border-blue-900">
                <h1 className="text-center text-xl font-bold my-4">Create an account!</h1>

                <form onSubmit ={handleSubmit} className="flex flex-col gap-3">
                    <input className="rounded-lg" onChange={e => setFirstName(e.target.value)} type="text" placeholder="First Name" />
                    <input className="rounded-lg" onChange={e => setLastName(e.target.value)} type="text" placeholder="Last Name" />
                    <input className="rounded-lg" onChange={e => setEmail(e.target.value)} type="text" placeholder="Email" />
                    <input className="rounded-lg" onChange={e => setPhone(e.target.value)} type="text" placeholder="Phone Number" />
                    <input className="rounded-lg" onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" />
                    <input className="rounded-lg" onChange={e => setConfirmPassword(e.target.value)} type="password" placeholder="Confirm Password" />
                    
                    <button className="bg-blue-900 text-white py-2 rounded-lg">
                        Sign Up
                    </button>

                    { error && (
                    <div className="bg-red-500 text-white w-fit text-sm py-1 px-3 rounded-md mt-2">
                        {error}
                    </div>
                    )}

                    <Link className="text-sm mt-3 text-right" href={"/signin"}>
                        Already have an account? &nbsp;
                        <span className="underline">SignIn</span>
                    </Link>
                </form>
            </div>        
        </div>
    );
}