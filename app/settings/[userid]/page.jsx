import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

import Settings from '@/components/Settings';
import { connectMongoDB } from '@/lib/mongodb';
import User from '@/models/user';
import Header from '@/components/Header';

export default async function UserProfilePage({ params }) {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/");

    const { userid } = params;
    const userId = userid;

    try {
        await connectMongoDB();
        const user = await User.findById(userId).lean();
        if (!user) {
            return <div>User not found</div>;
        }

        // Convert the user document to a plain object
        const plainUser = JSON.parse(JSON.stringify(user));

        return (
            <div className="min-h-screen flex flex-col">
                <header className="border-b sticky top-0 bg-white z-50">
                    <Header />
                </header>
            
                <Settings userId={userId} initialUser={plainUser} />
            </div>
        );

    } catch (error) {
        console.error('Error fetching user:', error);
        return <div>Error loading user data</div>;
    }
}