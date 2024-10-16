import Communication from "@/components/Communication";
import Header from "@/components/Header";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function CommunicationPage() {

    const session = await getServerSession(authOptions);
    if (!session) redirect("/");

    return (
    
    <div className="min-h-screen flex flex-col">
        <header className="border-b sticky top-0 bg-white z-50">
            <Header />
        </header>
        
        <Communication session={session}/>
    </div>
    );
}