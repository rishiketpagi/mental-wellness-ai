import { QUICK_ACTIONS } from "../../utils/homeUtils";

export default function HomeQuickActions({ navigate }) {
    return (
        <section className="grid grid-cols-4 gap-2 sm:gap-3">
            {QUICK_ACTIONS.map((a) => (
                <button
                    key={a.path}
                    onClick={() => navigate(a.path)}
                    className={`group flex flex-col items-center gap-1.5 rounded-2xl bg-gradient-to-br ${a.color} p-3 text-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md sm:gap-2 sm:p-4`}
                >
                    <span className="text-xl transition-transform group-hover:scale-110 sm:text-2xl">{a.emoji}</span>
                    <span className="text-[11px] font-bold sm:text-xs">{a.label}</span>
                </button>
            ))}
        </section>
    );
}
