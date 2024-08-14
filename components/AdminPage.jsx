"use client"; // Add this line at the top of your file

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Do nothing while loading
    if (!session || !session.user.isAdmin) {
      router.push("/"); // Redirect to home page if not admin
    }
  }, [session, status, router]);

  // If the session is loading, you can show a loading spinner or message here
  if (status === "loading") return <div>Loading...</div>;

  return (
    <div>
      <h1>Admin Page</h1>
      <p>Welcome, {session.user.firstName}!</p>
      {/* Your admin page content goes here */}
    </div>
  );
}
