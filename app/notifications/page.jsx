import Notifications from "@/components/Notifications";
import Header from "@/components/Header";

export default function notifications() {
    return (
        <div className="min-h-screen flex flex-col">
            <header className="border-b sticky top-0 bg-white z-50 ">
                <Header />
            </header>

                <Notifications />
        </div>
    );
}
