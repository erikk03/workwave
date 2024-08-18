// app/friendrequest/page.jsx
import SendFriendRequest from "@/components/SendFriendRequest";

export default function FriendRequestPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <header className="border-b sticky top-0 bg-white z-50">
                <h1 className="text-2xl font-semibold mb-4">Send Friend Request</h1>
            </header>
            <main className="p-5">
                <SendFriendRequest />
            </main>
        </div>
    );
}
