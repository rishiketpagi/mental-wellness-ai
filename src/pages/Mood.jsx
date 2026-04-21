import { useState } from "react";
import { auth, db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const MOODS = [
    {
        value: "Happy",
        emoji: "😊",
        label: "Happy",
        desc: "Feeling good and positive",
        bg: "from-green-50 to-emerald-50",
        border: "border-emerald-200",
        active: "from-emerald-400 to-green-500",
        ring: "ring-emerald-300",
        text: "text-emerald-700",
        badge: "bg-emerald-100 text-emerald-700",
    },
    {
        value: "Neutral",
        emoji: "😐",
        label: "Neutral",
        desc: "Neither good nor bad",
        bg: "from-yellow-50 to-amber-50",
        border: "border-amber-200",
        active: "from-amber-400 to-yellow-500",
        ring: "ring-amber-300",
        text: "text-amber-700",
        badge: "bg-amber-100 text-amber-700",
    },
    {
        value: "Sad",
        emoji: "😔",
        label: "Sad",
        desc: "Feeling down or heavy",
        bg: "from-blue-50 to-sky-50",
        border: "border-blue-200",
        active: "from-blue-400 to-sky-500",
        ring: "ring-blue-300",
        text: "text-blue-700",
        badge: "bg-blue-100 text-blue-700",
    },
    {
        value: "Stressed",
        emoji: "😣",
        label: "Stressed",
        desc: "Overwhelmed or anxious",
        bg: "from-red-50 to-rose-50",
        border: "border-red-200",
        active: "from-red-400 to-rose-500",
        ring: "ring-red-300",
        text: "text-red-700",
        badge: "bg-red-100 text-red-700",
    },
];

function Mood() {
    const navigate = useNavigate();
    const [note, setNote] = useState("");
    const [selected, setSelected] = useState(null);
    const [saving, setSaving] = useState(false);

    const saveMood = async () => {
        if (!selected) return;
        try {
            const user = auth.currentUser;
            if (!user) return;
            setSaving(true);
            await addDoc(collection(db, "moods"), {
                userId: user.uid,
                mood: selected,
                note,
                createdAt: serverTimestamp(),
            });
            setNote("");
            setSelected(null);
            navigate("/home");
        } catch (error) {
            console.error("Save mood error:", error.message);
        } finally {
            setSaving(false);
        }
    };

    const selectedMood = MOODS.find((m) => m.value === selected);

    return (
        <section className="mx-auto w-full max-w-3xl space-y-4">
            {/* Header */}
            <header className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xl shadow-md">
                        😊
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-500 sm:text-xs">
                            Mood Check-In
                        </p>
                        <h1 className="mt-0.5 text-xl font-bold text-gray-900 sm:text-2xl">
                            How are you feeling?
                        </h1>
                    </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-gray-500 sm:text-base">
                    Pick the mood that best captures how you feel right now. There's no right or wrong answer.
                </p>
            </header>

            {/* Mood Cards */}
            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
                <p className="mb-4 text-sm font-semibold text-gray-700">Select your mood</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {MOODS.map((mood) => {
                        const isSelected = selected === mood.value;
                        return (
                            <button
                                key={mood.value}
                                onClick={() => setSelected(mood.value)}
                                className={`group relative flex flex-col items-center gap-2 rounded-2xl border-2 bg-gradient-to-b p-4 text-center transition-all duration-200 sm:p-5 ${
                                    isSelected
                                        ? `${mood.border} ${mood.bg} ring-2 ${mood.ring} scale-[1.03] shadow-md`
                                        : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
                                }`}
                            >
                                <span className={`text-4xl transition-transform duration-200 ${isSelected ? "scale-110" : "group-hover:scale-105"}`}>
                                    {mood.emoji}
                                </span>
                                <div>
                                    <p className={`text-sm font-bold ${isSelected ? mood.text : "text-gray-800"}`}>
                                        {mood.label}
                                    </p>
                                    <p className="mt-0.5 text-xs text-gray-400 leading-tight">
                                        {mood.desc}
                                    </p>
                                </div>
                                {isSelected && (
                                    <div className={`absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br ${mood.active} text-white text-[10px] shadow`}>
                                        ✓
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Note */}
                <div className="mt-5">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Add a note <span className="font-normal text-gray-400">(optional)</span>
                    </label>
                    <textarea
                        placeholder="What's on your mind? e.g. I felt tired after a long day..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows="3"
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 sm:text-base"
                    />
                </div>

                {/* Actions */}
                <div className="mt-5 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-between sm:items-center">
                    <button
                        onClick={() => navigate("/home")}
                        className="rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-200"
                    >
                        ← Back
                    </button>

                    <button
                        onClick={saveMood}
                        disabled={!selected || saving}
                        className={`rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-all duration-200 ${
                            selected && !saving
                                ? "bg-gradient-to-r from-indigo-500 to-violet-600 shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-200 hover:-translate-y-0.5"
                                : "bg-gray-300 cursor-not-allowed"
                        }`}
                    >
                        {saving
                            ? "Saving…"
                            : selected
                                ? `Log ${selectedMood?.emoji} ${selected}`
                                : "Select a mood first"}
                    </button>
                </div>
            </div>
        </section>
    );
}

export default Mood;