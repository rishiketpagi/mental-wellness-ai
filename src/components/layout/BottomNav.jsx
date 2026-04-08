import { useNavigate, useLocation } from "react-router-dom";

function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();

    const tabs = [
        { name: "Home", path: "/home", icon: "🏠" },
        { name: "Mood", path: "/mood", icon: "😊" },
        { name: "Journal", path: "/journal", icon: "📝" },
        { name: "Chat", path: "/chat", icon: "💬" },
        { name: "Resources", path: "/resources", icon: "🌿" },
    ];

    return (
        <div className="fixed bottom-0 left-0 w-full border-t border-gray-200 bg-white shadow-md md:hidden z-50">
            <div className="flex justify-around py-2">
                {tabs.map((tab) => {
                    const isActive = location.pathname === tab.path;

                    return (
                        <button
                            key={tab.path}
                            onClick={() => navigate(tab.path)}
                            className={`flex flex-col items-center text-xs ${isActive ? "text-indigo-600" : "text-gray-500"
                                }`}
                        >
                            <span className="text-xl">{tab.icon}</span>
                            <span>{tab.name}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default BottomNav;