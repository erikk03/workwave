import AdminPage from "@/components/AdminPage";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function Admin() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.isAdmin) {
    redirect("/");
  }

  return <AdminPage />;
}