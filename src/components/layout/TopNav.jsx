import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const NAV_ITEMS = [
    {
        name: "Home", path: "/home",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
        ),
    },
    {
        name: "Mood", path: "/mood",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 13s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
        ),
    },
    {
        name: "Journal", path: "/journal",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
            </svg>
        ),
    },
    {
        name: "Chat", path: "/chat",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
        ),
    },
    {
        name: "Resources", path: "/resources",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
        ),
    },
    {
        name: "Profile", path: "/profile",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </svg>
        ),
    },
];

function TopNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleNavigate = (path) => {
        navigate(path);
        setMenuOpen(false);
    };

    return (
        <nav className="sticky top-2 z-40 mb-4 rounded-2xl border border-white/70 bg-white/90 px-3 py-2.5 shadow-sm backdrop-blur-md sm:mb-5 sm:px-4 sm:py-3">
            <div className="flex items-center justify-between">
                {/* Brand */}
                <div
                    onClick={() => handleNavigate("/home")}
                    className="flex cursor-pointer items-center gap-2"
                >
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm shadow-sm">
                        🧠
                    </div>
                    <span className="truncate text-sm font-bold tracking-tight text-indigo-700 sm:text-base">
                        Calmora - Mental Wellness AI
                    </span>
                </div>

                {/* Desktop nav */}
                <div className="hidden items-center gap-1 md:flex">
                    {NAV_ITEMS.map((tab) => {
                        const isActive = location.pathname === tab.path;
                        return (
                            <button
                                key={tab.path}
                                onClick={() => handleNavigate(tab.path)}
                                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${isActive
                                        ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                                        : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-700"
                                    }`}
                            >
                                <span className={isActive ? "opacity-100" : "opacity-60"}>
                                    {tab.icon}
                                </span>
                                {tab.name}
                            </button>
                        );
                    })}
                </div>

                {/* Mobile burger */}
                <button
                    onClick={() => setMenuOpen((prev) => !prev)}
                    aria-label="Toggle navigation menu"
                    aria-expanded={menuOpen}
                    className="flex flex-col gap-1.5 rounded-xl border border-gray-200 bg-white p-2.5 transition hover:bg-gray-50 md:hidden"
                >
                    <span className={`block h-0.5 w-4 rounded bg-gray-600 transition-all ${menuOpen ? "translate-y-2 rotate-45" : ""}`} />
                    <span className={`block h-0.5 w-4 rounded bg-gray-600 transition-all ${menuOpen ? "opacity-0" : ""}`} />
                    <span className={`block h-0.5 w-4 rounded bg-gray-600 transition-all ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
                </button>
            </div>

            {/* Mobile dropdown */}
            {menuOpen && (
                <div className="mt-3 grid grid-cols-3 gap-2 border-t border-gray-100 pt-3 md:hidden">
                    {NAV_ITEMS.map((tab) => {
                        const isActive = location.pathname === tab.path;
                        return (
                            <button
                                key={tab.path}
                                onClick={() => handleNavigate(tab.path)}
                                className={`flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-xs font-semibold transition-all ${isActive
                                        ? "bg-indigo-600 text-white shadow-sm"
                                        : "bg-gray-50 text-gray-600 hover:bg-indigo-50 hover:text-indigo-700"
                                    }`}
                            >
                                <span className="scale-110">{tab.icon}</span>
                                {tab.name}
                            </button>
                        );
                    })}
                </div>
            )}
        </nav>
    );
}

export default TopNav;