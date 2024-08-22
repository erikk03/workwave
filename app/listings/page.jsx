import Listings from "@/components/Listings";

export default function FriendRequestsPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <header className="border-b sticky top-0 bg-white z-50">
                <h1 className="text-2xl font-semibold mb-4">Job Listings</h1>
            </header>
            <main className="p-5">
                <Listings />
            </main>
        </div>
    );
}
