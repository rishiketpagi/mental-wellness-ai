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
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-violet-50 to-white px-4 py-8">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-indigo-500">Support Library</p>
                            <h1 className="text-4xl font-bold text-gray-900 mt-2">
                                Wellness Resources
                            </h1>
                            <p className="text-gray-500 mt-2 max-w-2xl">
                                Simple, practical support for common emotional struggles.
                            </p>
                        </div>

                        <button
                            onClick={() => navigate("/home")}
                            className="rounded-2xl bg-gray-100 text-gray-700 px-5 py-3 font-medium hover:bg-gray-200 transition"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
                    {resources.map((item, index) => (
                        <div
                            key={index}
                            className={`rounded-3xl border p-6 shadow-lg bg-white`}
                        >
                            <div
                                className={`inline-block rounded-full px-4 py-2 text-sm font-medium border ${colorMap[item.color]}`}
                            >
                                {item.title}
                            </div>

                            <ul className="mt-5 space-y-3 text-gray-600">
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
            </div>
        </div>
    );
}

export default Resources;