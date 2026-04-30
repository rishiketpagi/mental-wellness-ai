import { RESOURCE_COLOR } from "../../utils/resourcesUtils";

export default function ResourceCard({ item, index }) {
    const c = RESOURCE_COLOR[item.color];
    const isUrgent = item.color === "amber";

    return (
        <div
            className={`group rounded-3xl border bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md overflow-hidden ${isUrgent ? "border-amber-200" : "border-gray-100"
                }`}
        >
            {/* Card header gradient */}
            <div className={`bg-gradient-to-r ${c.header} p-5`}>
                <div className="flex items-center gap-3">
                    <span className="text-3xl">{item.emoji}</span>
                    <div>
                        <h2 className="text-base font-bold text-white">{item.title}</h2>
                        <p className="text-xs text-white/75">{item.desc}</p>
                    </div>
                </div>
            </div>

            {/* Tips */}
            <div className="p-5">
                <ul className="space-y-2.5">
                    {item.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-3">
                            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${c.bullet}`} />
                            <span className="text-sm leading-relaxed text-gray-700">{tip}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
