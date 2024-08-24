import Jobs from "@/components/Jobs";
import Header from "@/components/Header";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function jobs() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/");
    
    return (
        <div className="min-h-screen flex flex-col">
            
            <header className="border-b sticky top-0 bg-white z-50 ">
                <Header />
            </header>

            <Jobs />
            
        </div>
    );
}
