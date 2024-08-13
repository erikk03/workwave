import UserInfo from "@/components/UserInfo";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function Feed() {

  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  return <UserInfo />;
}