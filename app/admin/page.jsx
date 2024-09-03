import AdminPage from "@/components/AdminPage";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Header from "@/components/Header";

export default async function Admin() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.isAdmin) {
    redirect("/");
  }

  return(
    <div className="min-h-screen flex flex-col">
      <header className="border-b sticky top-0 bg-white z-50 ">
        <Header />
      </header>

      <AdminPage />
    </div>
  );
}