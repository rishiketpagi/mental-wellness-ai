import { MOOD_EMOJI } from "../../utils/homeUtils";

export default function HomeStats({ moods, journals, streak, weeklyMood }) {
    const stats = [
        { label: "Moods", value: moods.length, from: "from-indigo-100", to: "to-indigo-50", border: "border-indigo-100", lbl: "text-indigo-600", num: "text-indigo-800" },
        { label: "Journals", value: journals.length, from: "from-violet-100", to: "to-violet-50", border: "border-violet-100", lbl: "text-violet-600", num: "text-violet-800" },
        { label: "Streak", value: streak > 0 ? `🔥 ${streak}d` : "—", from: "from-amber-100", to: "to-amber-50", border: "border-amber-100", lbl: "text-amber-600", num: "text-amber-800" },
        { label: "This Week", value: `${MOOD_EMOJI[weeklyMood] || "—"} ${weeklyMood === "None" ? "—" : weeklyMood}`, from: "from-emerald-100", to: "to-emerald-50", border: "border-emerald-100", lbl: "text-emerald-600", num: "text-emerald-800" },
    ];

    return (
        <section className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            {stats.map((s) => (
                <div key={s.label} className={`rounded-2xl border bg-gradient-to-b ${s.from} ${s.to} ${s.border} p-3 sm:p-4`}>
                    <p className={`text-[11px] font-semibold ${s.lbl}`}>{s.label}</p>
                    <p className={`mt-1 text-xl font-extrabold ${s.num} sm:text-2xl`}>{s.value}</p>
                </div>
            ))}
        </section>
    );
}
