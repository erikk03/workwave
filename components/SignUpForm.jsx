// 'use client';

// import Link from 'next/link';
// import {useState} from 'react';

// import { useRouter } from 'next/navigation';

// export default function SignUpForm() {
//     const [FirstName, setFirstName] = useState("");
//     const [LastName, setLastName] = useState("");
//     const [Email, setEmail] = useState("");
//     const [Phone, setPhone] = useState("");
//     const [Password, setPassword] = useState("");
//     const [ConfirmPassword, setConfirmPassword] = useState("");
//     const [error, setError] = useState("");

//     const router = useRouter();

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         if(!FirstName || !LastName || !Email || !Phone || !Password || !ConfirmPassword) {
//             setError("Please fill all the fields");
//             return;
//         }
    
//         const emailRegex = /^[A-Za-z0-9._%+-]+@(gmail|yahoo|di.uoa|uoa)\.(com|gr)$/;
//         if (!emailRegex.test(Email)) {
//             setError("Invalid email format");
//             return;
//         }
        
//         if (Phone.length !== 10) {
//             setError("Phone number must be 10 digits");
//             return;
//         }
                
//         const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9]).{8,}$/;

//         if (!passwordRegex.test(Password)) {
//             let error = "Password must have:\n";
//             let conditions = [];
        
//             if (!/(?=.*[A-Z])/.test(Password)) {
//                 conditions.push(" - at least one uppercase letter");
//             }
//             if (!/(?=.*[!@#$&*])/.test(Password)) {
//                 conditions.push(" - at least one symbol");
//             }
//             if (!/(?=.*[0-9])/.test(Password)) {
//                 conditions.push(" - at least one number");
//             }
//             if (Password.length < 8) {
//                 conditions.push(" - at least 8 characters");
//             }

//             if (conditions.length > 0) {
//                 error += conditions.join("\n");
//                 setError(error);
//             }
        
//             return;
//         }
        

//         if (Password !== ConfirmPassword) {
//             setError("Passwords do not match");
//             return;
//         }
        
        
//         try {

//             const resUserExist = await fetch("api/userExists", {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({ Email }),
//             });

//             const { user } = await resUserExist.json();

//             if(user) {
//                 setError("User already exists");
//                 return;
//             }

//             const res = await fetch("api/signup", {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json"
//                 },
//                 body: JSON.stringify({
//                     FirstName, 
//                     LastName,
//                     Email,
//                     Phone,
//                     Password,
//                     ConfirmPassword
//                 }),
//             });

//             if(res.ok) {
//                 const form = e.target;
//                 form.reset();
//                 router.push("/signin"); //redirect to signin page after successful signup
//             }
//             else {
//                 console.log("Error during sign up");
//             }
            
//         }catch (error) {
//             console.log("Error while signing up", error); 
//         }
//     };
    
//     return(
//         <div className="grid place-items-center h-screen">
//             <div className="shadow-2xl p-5 rounded-lg border-t-4 border-blue-900">
//                 <h1 className="text-center text-xl font-bold my-4">Create an account!</h1>

//                 <form onSubmit ={handleSubmit} className="flex flex-col gap-3">
//                     <input className="rounded-lg" onChange={e => setFirstName(e.target.value)} type="text" placeholder="First Name" />
//                     <input className="rounded-lg" onChange={e => setLastName(e.target.value)} type="text" placeholder="Last Name" />
//                     <input className="rounded-lg" onChange={e => setEmail(e.target.value)} type="text" placeholder="Email" />
//                     <input className="rounded-lg" onChange={e => setPhone(e.target.value)} type="text" placeholder="Phone Number" />
//                     <input className="rounded-lg" onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" />
//                     <input className="rounded-lg" onChange={e => setConfirmPassword(e.target.value)} type="password" placeholder="Confirm Password" />
                    
//                     <button className="bg-blue-900 text-white py-2 rounded-lg">
//                         Sign Up
//                     </button>

//                     { error && (
//                     <div className="bg-red-500 text-white w-fit text-sm py-1 px-3 rounded-md mt-2 " style={{ whiteSpace: 'pre-line' }}>
//                         {error}
//                     </div>
//                     )}

//                     <Link className="text-sm mt-3 text-right" href={"/signin"}>
//                         Already have an account? &nbsp;
//                         <span className="underline">SignIn</span>
//                     </Link>
//                 </form>
//             </div>        
//         </div>
//     );
// }

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignUpForm() {
    const [FirstName, setFirstName] = useState("");
    const [LastName, setLastName] = useState("");
    const [Email, setEmail] = useState("");
    const [Phone, setPhone] = useState("");
    const [Password, setPassword] = useState("");
    const [ConfirmPassword, setConfirmPassword] = useState("");
    const [ProfileImage, setProfileImage] = useState(null);
    const [error, setError] = useState("");

    const router = useRouter();

    const handleImageChange = (e) => {
        setProfileImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if(!FirstName || !LastName || !Email || !Phone || !Password || !ConfirmPassword) {
            setError("Please fill all the fields");
            return;
        }

        // Validate email, phone, and password (same as before)
        const emailRegex = /^[A-Za-z0-9._%+-]+@(gmail|yahoo|di.uoa|uoa)\.(com|gr)$/;
        if (!emailRegex.test(Email)) {
            setError("Invalid email format");
            return;
        }

        if (Phone.length !== 10) {
            setError("Phone number must be 10 digits");
            return;
        }

        const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9]).{8,}$/;
        if (!passwordRegex.test(Password)) {
            let error = "Password must have:\n";
            let conditions = [];
            if (!/(?=.*[A-Z])/.test(Password)) conditions.push(" - at least one uppercase letter");
            if (!/(?=.*[!@#$&*])/.test(Password)) conditions.push(" - at least one symbol");
            if (!/(?=.*[0-9])/.test(Password)) conditions.push(" - at least one number");
            if (Password.length < 8) conditions.push(" - at least 8 characters");
            error += conditions.join("\n");
            setError(error);
            return;
        }

        if (Password !== ConfirmPassword) {
            setError("Passwords do not match");
            return;
        }

        const formData = new FormData();
        formData.append('FirstName', FirstName);
        formData.append('LastName', LastName);
        formData.append('Email', Email);
        formData.append('Phone', Phone);
        formData.append('Password', Password);
        formData.append('ConfirmPassword', ConfirmPassword);
        if (ProfileImage) formData.append('ProfileImage', ProfileImage);

        try {
            const res = await fetch('/api/signup', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                const form = e.target;
                form.reset();
                router.push("/signin");
            } else {
                console.log("Error during sign up");
            }
            
        } catch (error) {
            console.log("Error while signing up", error); 
        }
    };

    return (
        <div className="grid place-items-center h-screen">
            <div className="shadow-2xl p-5 rounded-lg border-t-4 border-blue-900">
                <h1 className="text-center text-xl font-bold my-4">Create an account!</h1>
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <input className="rounded-lg" onChange={e => setFirstName(e.target.value)} type="text" placeholder="First Name" />
                    <input className="rounded-lg" onChange={e => setLastName(e.target.value)} type="text" placeholder="Last Name" />
                    <input className="rounded-lg" onChange={e => setEmail(e.target.value)} type="text" placeholder="Email" />
                    <input className="rounded-lg" onChange={e => setPhone(e.target.value)} type="text" placeholder="Phone Number" />
                    <input className="rounded-lg" onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" />
                    <input className="rounded-lg" onChange={e => setConfirmPassword(e.target.value)} type="password" placeholder="Confirm Password" />
                    <input className="rounded-lg" type="file" accept="image/*" onChange={handleImageChange} />
                    
                    <button className="bg-blue-900 text-white py-2 rounded-lg">
                        Sign Up
                    </button>

                    { error && (
                    <div className="bg-red-500 text-white w-fit text-sm py-1 px-3 rounded-md mt-2 " style={{ whiteSpace: 'pre-line' }}>
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
