import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";
import Header from "@/components/Header";

export default async function Feed() {

  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">

        <header className="border-b sticky top-0 bg-white z-50">
          <Header />
        </header>
      
      </body>
    </html>

  );
}