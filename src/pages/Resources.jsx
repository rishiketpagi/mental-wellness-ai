import { useNavigate } from "react-router-dom";

const RESOURCES = [
    {
        title: "Exam Stress",

        color: "indigo",
        desc: "Managing academic pressure",
        tips: [
            "Break study time into small 25-minute sessions.",
            "Take short breaks between study blocks.",
            "Avoid comparing your progress with others.",
            "Focus on one subject or one task at a time.",
        ],
    },
    {
        title: "Anxiety & Overthinking",

        color: "violet",
        desc: "Calming a busy mind",
        tips: [
            "Pause and name what you are feeling.",
            "Write your thoughts down instead of holding them inside.",
            "Take 5 slow, deep breaths.",
            "Focus on what is in your control right now.",
        ],
    },
    {
        title: "Sleep Support",
        color: "blue",
        desc: "Building restful habits",
        tips: [
            "Avoid using your phone right before sleep.",
            "Try sleeping at the same time every night.",
            "Reduce caffeine late in the day.",
            "Use calm breathing before bed.",
        ],
    },
    {
        title: "Grounding Exercise",

        color: "emerald",
        desc: "5-4-3-2-1 technique",
        tips: [
            "Name 5 things you can see.",
            "Name 4 things you can touch.",
            "Name 3 things you can hear.",
            "Name 2 things you can smell.",
            "Name 1 thing you can taste.",
        ],
    },
    {
        title: "When You Feel Low",

        color: "rose",
        desc: "Small steps when it's hard",
        tips: [
            "Talk to one trusted person.",
            "Drink water and move your body a little.",
            "Do one very small task, not everything at once.",
            "Remind yourself that difficult feelings can pass.",
        ],
    },
    {
        title: "Urgent Help",

        color: "amber",
        desc: "Crisis support resources",
        tips: [
            "If you feel unsafe, do not stay alone.",
            "Contact a trusted friend, family, teacher, or counselor.",
            "Call Tele-MANAS: 14416 (Toll-Free: 1800-89-14416, 24/7).",
            "Seek immediate in-person help if needed.",
        ],
    },
];

const COLOR = {
    indigo: {
        header: "from-indigo-500 to-violet-600",
        badge: "bg-indigo-100 text-indigo-700",
        bullet: "bg-indigo-400",
        border: "border-indigo-100",
    },
    violet: {
        header: "from-violet-500 to-purple-600",
        badge: "bg-violet-100 text-violet-700",
        bullet: "bg-violet-400",
        border: "border-violet-100",
    },
    blue: {
        header: "from-blue-500 to-sky-600",
        badge: "bg-blue-100 text-blue-700",
        bullet: "bg-blue-400",
        border: "border-blue-100",
    },
    emerald: {
        header: "from-emerald-500 to-teal-600",
        badge: "bg-emerald-100 text-emerald-700",
        bullet: "bg-emerald-400",
        border: "border-emerald-100",
    },
    rose: {
        header: "from-rose-500 to-pink-600",
        badge: "bg-rose-100 text-rose-700",
        bullet: "bg-rose-400",
        border: "border-rose-100",
    },
    amber: {
        header: "from-amber-500 to-orange-500",
        badge: "bg-amber-100 text-amber-800",
        bullet: "bg-amber-400",
        border: "border-amber-200",
    },
};

function Resources() {
    const navigate = useNavigate();

    return (
        <section className="mx-auto w-full max-w-6xl space-y-4">
            {/* Header */}
            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-xl shadow-md">
                            🌿
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-500 sm:text-xs">
                                Support Library
                            </p>
                            <h1 className="mt-0.5 text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">
                                Wellness Resources
                            </h1>
                            <p className="mt-1 max-w-xl text-sm text-gray-500 sm:text-base">
                                Simple, practical support for common emotional struggles.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate("/home")}
                        className="self-start rounded-xl bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-200"
                    >
                        ← Back
                    </button>
                </div>
            </div>

            {/* Resource grid */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {RESOURCES.map((item, index) => {
                    const c = COLOR[item.color];
                    const isUrgent = item.color === "amber";
                    return (
                        <div
                            key={index}
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
                })}
            </div>
        </section>
    );
}

export default Resources;