"use client";

import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";

export default function UserInfo() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div className="grid place-items-center h-screen">
      <div className="shadow-2xl p-5 rounded-lg border-t-4 border-blue-900 bg-zinc-300/10 flex flex-col gap-3 my-6">
        {session?.user?.profileImage ? (
          <img
            src={session.user.profileImage}
            alt="User Image"
            className="w-24 h-24 rounded-full mx-auto mb-4"
          />
        ): (
          <div>No profile image available</div>
        )}

        <div>
          Name: <span className="font-bold">{session?.user?.firstName + " " + session?.user?.lastName}</span>
        </div>
        <div>
          Email: <span className="font-bold">{session?.user?.email}</span>
        </div>
        <button
          onClick={() => signOut()}
          className="bg-red-500 text-white w-fit text-sm px-4 py-1 rounded-md mt-2 mx-auto"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
