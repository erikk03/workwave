"use client";

import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { Avatar } from "@nextui-org/avatar";
import { Button } from "@nextui-org/react";

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
          <Avatar
              isBordered
              color="primary"
              size="lg"
              radius="full"
              className="w-24 h-24 mx-auto mb-4"
              src={session?.user?.profileImage}
          />
        ):(
          <Avatar
              isBordered
              color=""
              size="lg"
              radius="full"
              className="w-24 h-24 mx-auto mb-4"
              name={session?.user?.firstName.charAt(0) + session?.user?.lastName.charAt(0)}
          />
          )}

        <div>
          Name: <span className="font-bold">{session?.user?.firstName + " " + session?.user?.lastName}</span>
        </div>
        <div>
          Email: <span className="font-bold">{session?.user?.email}</span>
        </div>

        <Button
          onClick={() => signOut()}
          color="danger"
          size="sm"
          radius="sm"
          variant="ghost"
          className="w-fit text-sm mx-auto"
        >
          Log Out
        </Button>
      </div>
    </div>
  );
}
