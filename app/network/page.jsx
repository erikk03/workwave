import Network from "@/components/Network";
import Header from "@/components/Header";

export default function NetworkPage() {


    return (
    
    <div className="min-h-screen flex flex-col">
        <header className="border-b sticky top-0 bg-white z-50">
            <Header />
        </header>
        
        <Network />
    </div>
    );
}
