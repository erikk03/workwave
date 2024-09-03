import SelectedUsersContent from "@/components/SelectedUsersContent";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function SelectedUsersPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/");

    return (
        <SelectedUsersContent />
    );
}

