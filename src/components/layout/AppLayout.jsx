import TopNav from "./TopNav";
import BottomNav from "./BottomNav";

function AppLayout({ children }) {
    return (
        <div className="min-h-screen overflow-x-clip bg-gradient-to-br from-sky-50 via-indigo-50 to-white">
            <div className="mx-auto w-full max-w-6xl px-3 pb-24 pt-3 sm:px-4 sm:pb-28 sm:pt-4 md:pb-8 lg:px-6">
                <TopNav />
                <main className="space-y-4 sm:space-y-5">
                    {children}
                </main>
            </div>
            <BottomNav />
        </div>
    );
}

export default AppLayout;