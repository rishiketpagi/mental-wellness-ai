import { useNavigate } from "react-router-dom";

function Resources() {
    const navigate = useNavigate();

    const resources = [
        {
            title: "Exam Stress",
            color: "indigo",
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
            tips: [
                "Pause and name what you are feeling.",
                "Write your thoughts down instead of holding them inside.",
                "Take 5 slow breaths.",
                "Focus on what is in your control right now.",
            ],
        },
        {
            title: "Sleep Support",
            color: "blue",
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
            tips: [
                "If you feel unsafe, do not stay alone.",
                "Contact a trusted friend, family member, teacher, or counselor.",
                "Seek immediate in-person help if needed.",
                "Use emergency support options available to you.",
            ],
        },
    ];

    const colorMap = {
        indigo: "bg-indigo-50 border-indigo-100 text-indigo-700",
        violet: "bg-violet-50 border-violet-100 text-violet-700",
        blue: "bg-blue-50 border-blue-100 text-blue-700",
        emerald: "bg-emerald-50 border-emerald-100 text-emerald-700",
        rose: "bg-rose-50 border-rose-100 text-rose-700",
        amber: "bg-amber-50 border-amber-100 text-amber-700",
    };

    return (
        <section className="mx-auto w-full max-w-6xl space-y-3 sm:space-y-4">
            <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6 md:p-7">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-500 sm:text-xs">Support Library</p>
                        <h1 className="mt-1.5 text-xl font-bold text-gray-900 sm:text-2xl md:text-4xl">
                            Wellness Resources
                        </h1>
                        <p className="mt-1.5 max-w-2xl text-xs text-gray-500 sm:text-sm md:text-base">
                            Simple, practical support for common emotional struggles.
                        </p>
                    </div>

                    <button
                        onClick={() => navigate("/home")}
                        className="rounded-xl bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-200 sm:px-5 sm:py-2.5 sm:text-sm"
                    >
                        Back to dashboard
                    </button>
                </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:gap-4 xl:grid-cols-3">
                {resources.map((item, index) => (
                    <div
                        key={index}
                        className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5"
                    >
                        <div
                            className={`inline-block rounded-full px-4 py-2 text-sm font-medium border ${colorMap[item.color]}`}
                        >
                            {item.title}
                        </div>

                        <ul className="mt-3.5 space-y-2.5 text-xs text-gray-600 sm:text-sm">
                            {item.tips.map((tip, i) => (
                                <li key={i} className="flex gap-3">
                                    <span className="text-indigo-500 font-bold">•</span>
                                    <span>{tip}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default Resources;