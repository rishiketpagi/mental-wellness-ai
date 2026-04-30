import Ring from "./Ring";

export default function ProfileStats({
    moodCount,
    journalCount,
    streak,
    moodPct,
    jPct,
    streakPct,
}) {
    const stats = [
        {
            icon: "😊",
            label: "Moods",
            count: moodCount,
            pct: moodPct,
            color: "#6366f1",
        },
        {
            icon: "📝",
            label: "Journals",
            count: journalCount,
            pct: jPct,
            color: "#7c3aed",
        },
        {
            icon: "🔥",
            label: "Day Streak",
            count: streak || "—",
            pct: streakPct,
            color: "#f59e0b",
        },
    ];

    return (
        <section className="profile-fade profile-fade-1 grid grid-cols-3 gap-3 sm:gap-4">
            {stats.map((s) => (
                <div
                    key={s.label}
                    className="flex flex-col items-center gap-2 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5"
                >
                    <div className="relative">
                        <Ring pct={s.pct} color={s.color} size={72} stroke={7} />
                        <div className="absolute inset-0 flex items-center justify-center text-xl">
                            {s.icon}
                        </div>
                    </div>

                    <p className="text-xl font-extrabold text-gray-900 sm:text-2xl">
                        {s.count}
                    </p>

                    <p className="text-xs font-bold text-gray-600">{s.label}</p>
                </div>
            ))}
        </section>
    );
}