export const QUOTES = [
    "You do not need to solve everything today.",
    "Small steps still count as progress.",
    "Rest is not failure. It is part of healing.",
    "Your feelings are real, and they deserve care.",
    "It is okay to slow down and breathe.",
    "You are allowed to ask for support.",
    "A difficult day does not define your whole journey.",
];

export const QUICK_ACTIONS = [
    { emoji: "😊", label: "Mood", path: "/mood", color: "from-indigo-500 to-indigo-600" },
    { emoji: "📝", label: "Journal", path: "/journal", color: "from-violet-500 to-violet-600" },
    { emoji: "💬", label: "Chat", path: "/chat", color: "from-emerald-500 to-teal-600" },
    { emoji: "🌿", label: "Resources", path: "/resources", color: "from-teal-500 to-cyan-600" },
];

export const MOOD_EMOJI = {
    Happy: "😊",
    Neutral: "😐",
    Sad: "😔",
    Stressed: "😣",
    None: "—",
};

export const formatDate = (ts) => {
    if (!ts) return "";
    return ts.toDate().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
    });
};