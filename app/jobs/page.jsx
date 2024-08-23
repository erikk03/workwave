import Jobs from "@/components/Jobs";
import Header from "@/components/Header";

export default function jobs() {
    return (
        <div className="min-h-screen flex flex-col">
            
            <header className="border-b sticky top-0 bg-white z-50 ">
                <Header />
            </header>

            <Jobs />
            
        </div>
    );
}
