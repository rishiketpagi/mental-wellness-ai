/* ─── Home page helpers & constants ───────────────────────────────────────── */

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
    { emoji: "😊", label: "Mood",      path: "/mood",      color: "from-indigo-500 to-indigo-600"  },
    { emoji: "📝", label: "Journal",   path: "/journal",   color: "from-violet-500 to-violet-600"  },
    { emoji: "💬", label: "Chat",      path: "/chat",      color: "from-emerald-500 to-teal-600"   },
    { emoji: "🌿", label: "Resources", path: "/resources", color: "from-teal-500 to-cyan-600"      },
];

export const MOOD_EMOJI = { Happy: "😊", Neutral: "😐", Sad: "😔", Stressed: "😣", None: "—" };

export const getMoodStyle = (mood) => {
    const m = mood?.toLowerCase();
    if (m === "happy")    return { emoji: "😊", bg: "bg-green-50",  border: "border-green-200",  badge: "bg-green-100 text-green-700"  };
    if (m === "sad")      return { emoji: "😔", bg: "bg-blue-50",   border: "border-blue-200",   badge: "bg-blue-100 text-blue-700"    };
    if (m === "stressed") return { emoji: "😣", bg: "bg-red-50",    border: "border-red-200",    badge: "bg-red-100 text-red-700"      };
    return                       { emoji: "😐", bg: "bg-yellow-50", border: "border-yellow-200", badge: "bg-yellow-100 text-yellow-700" };
};

export const getMoodInsight = (moods) => {
    if (!moods.length) return {
        title: "No insights yet", message: "Log a mood to get started.",
        from: "from-gray-50", to: "to-white", border: "border-gray-200", label: "text-gray-500", body: "text-gray-700",
    };
    const recent = moods.slice(0, 5).map((m) => m.mood?.toLowerCase());
    const count  = (v) => recent.filter((m) => m === v).length;
    if (count("stressed") >= 3) return { title: "Stress noticed 😣", message: "Consider a short break or talking to someone.", from: "from-red-50",    to: "to-rose-50",    border: "border-red-200",    label: "text-red-500",    body: "text-red-900"    };
    if (count("sad")      >= 3) return { title: "Low mood trend 😔", message: "Be gentle with yourself — reach out if you need.", from: "from-blue-50",   to: "to-sky-50",     border: "border-blue-200",   label: "text-blue-500",   body: "text-blue-900"   };
    if (count("happy")    >= 3) return { title: "Positive trend 🎉", message: "Keep going — notice what's working for you.",       from: "from-green-50",  to: "to-emerald-50", border: "border-green-200",  label: "text-green-500",  body: "text-green-900"  };
    if (count("neutral")  >= 3) return { title: "Steady pattern 😐", message: "Daily check-ins help you notice early changes.",     from: "from-yellow-50", to: "to-amber-50",   border: "border-yellow-200", label: "text-yellow-500", body: "text-yellow-900" };
    return { title: "Mixed moods", message: "Completely normal — keep checking in regularly.", from: "from-violet-50", to: "to-indigo-50", border: "border-violet-200", label: "text-violet-500", body: "text-violet-900" };
};

export const getDailyStreak = (moods) => {
    if (!moods.length) return 0;
    const dates = new Set(moods.filter((m) => m.createdAt).map((m) => {
        const d = m.createdAt.toDate(); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    }));
    let streak = 0;
    for (let i = 0; i < 365; i++) {
        const c = new Date(); c.setDate(c.getDate() - i);
        if (dates.has(`${c.getFullYear()}-${c.getMonth()}-${c.getDate()}`)) streak++; else break;
    }
    return streak;
};

export const getWeeklyDominant = (moods) => {
    const counts = { Happy: 0, Neutral: 0, Sad: 0, Stressed: 0 };
    const ago = new Date(); ago.setDate(ago.getDate() - 6);
    moods.filter((m) => m.createdAt && m.createdAt.toDate() >= ago)
         .forEach((m) => { if (counts[m.mood] !== undefined) counts[m.mood]++; });
    let best = "None", max = 0;
    Object.entries(counts).forEach(([k, v]) => { if (v > max) { max = v; best = k; } });
    return best;
};