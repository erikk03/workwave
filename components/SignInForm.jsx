"use client";

import Link from "next/link";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res.error) {
        setError("Invalid email or password");
        return;
      }

      // Check the user's admin status
      if (res.ok) {
        // Fetch the session to check the user's role
        const session = await fetch("/api/auth/session");
        const sessionData = await session.json();

        if (sessionData.user.isAdmin) {
          router.replace("/admin"); // Redirect to admin page if the user is an admin
        } else {
          router.replace("/feed"); // Redirect to the feed page if the user is not an admin
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="grid place-items-center h-screen">
      <div className="shadow-2xl p-5 rounded-lg border-t-4 border-blue-900">
        <h1 className="text-center text-xl font-bold my-4">Sign In</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg"
            type="text"
            placeholder="Email"
          />
          <input
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg"
            type="password"
            placeholder="Password"
          />
          <button className="bg-blue-900 text-white py-2 rounded-lg">
            Sign In
          </button>

          {error && (
            <div className="bg-red-500 text-white w-fit text-sm py-1 px-3 rounded-md mt-2">
              {error}
            </div>
          )}

          <Link className="text-sm mt-3 text-right" href={"/signup"}>
            Don't have an account? &nbsp;
            <span className="underline">Create Account</span>
          </Link>
        </form>
      </div>
    </div>
  );
}
