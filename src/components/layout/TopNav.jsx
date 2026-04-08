import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function TopNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const tabs = [
        { name: "Home", path: "/home", icon: "Home" },
        { name: "Mood", path: "/mood", icon: "Mood" },
        { name: "Journal", path: "/journal", icon: "Journal" },
        { name: "Chat", path: "/chat", icon: "Chat" },
        { name: "Resources", path: "/resources", icon: "Resources" },
        { name: "Profile", path: "/profile", icon: "Profile" },
    ];

    const handleNavigate = (path) => {
        navigate(path);
        setMenuOpen(false);
    };

    return (
        <nav className="sticky top-2 z-40 mb-4 rounded-2xl border border-white/70 bg-white/95 px-3 py-2.5 shadow-sm backdrop-blur sm:mb-5 sm:px-4 sm:py-3">
            <div className="flex items-center justify-between">
                <h1
                    onClick={() => handleNavigate("/home")}
                    className="max-w-[70%] cursor-pointer truncate text-sm font-bold tracking-tight text-indigo-700 sm:text-base md:max-w-none md:text-lg"
                >
                    Mental Wellness AI
                </h1>

                <div className="hidden items-center gap-2 md:flex">
                    {tabs.map((tab) => {
                        const isActive = location.pathname === tab.path;

                        return (
                            <button
                                key={tab.path}
                                onClick={() => handleNavigate(tab.path)}
                                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${isActive
                                    ? "bg-indigo-100 text-indigo-700"
                                    : "text-gray-600 hover:bg-gray-100"
                                    }`}
                            >
                                {tab.name}
                            </button>
                        );
                    })}
                </div>

                <button
                    onClick={() => setMenuOpen((prev) => !prev)}
                    aria-label="Toggle navigation menu"
                    aria-expanded={menuOpen}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-700 transition hover:bg-gray-50 md:hidden"
                >
                    {menuOpen ? "Close" : "Menu"}
                </button>
            </div>

            {menuOpen && (
                <div className="mt-3 grid grid-cols-2 gap-2 border-t border-gray-100 pt-3 md:hidden">
                    {tabs.map((tab) => {
                        const isActive = location.pathname === tab.path;

                        return (
                            <button
                                key={tab.path}
                                onClick={() => handleNavigate(tab.path)}
                                className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${isActive
                                    ? "bg-indigo-100 text-indigo-700"
                                    : "text-gray-600 hover:bg-gray-100"
                                    }`}
                            >
                                <span className="text-[10px] uppercase tracking-wide text-gray-400">{tab.icon}</span>
                                <p className="mt-0.5 leading-tight">{tab.name}</p>
                            </button>
                        );
                    })}
                </div>
            )}
        </nav>
    );
}

export default TopNav;