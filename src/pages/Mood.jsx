import { useState } from "react";
import { auth } from "../firebase";
import { MOODS } from "../utils/constants";
import { saveMoodToFirestore } from "../services/moodService";
import { useNavigate } from "react-router-dom";
import useMood from "../hooks/useMood";
import MoodSelector from "../components/mood/MoodSelector";
import MoodNote from "../components/mood/MoodNote";
import RecentMoods from "../components/mood/RecentMoods";
import MoodSummary from "../components/mood/MoodSummary";

function Mood() {
    const navigate = useNavigate();
    const [note, setNote] = useState("");
    const [selected, setSelected] = useState(null);
    const [saving, setSaving] = useState(false);

    const user = auth.currentUser;
    const { recentMoods, weeklySummary, loading, refetch } = useMood(user?.uid);

    const saveMood = async () => {
        if (!selected) return;
        try {
            if (!user) return;
            setSaving(true);
            await saveMoodToFirestore(user.uid, selected, note);
            setNote("");
            setSelected(null);
            // Refetch recent moods after saving
            await refetch();
        } catch (error) {
            console.error("Save mood error:", error.message);
        } finally {
            setSaving(false);
        }
    };

    const selectedMood = MOODS.find((m) => m.value === selected);

    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            {/* Left: Mood Form */}
            <section className="lg:col-span-3 space-y-4">
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

                {/* Mood Cards + Note + Actions */}
                <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
                    <p className="mb-4 text-sm font-semibold text-gray-700">Select your mood</p>

                    <MoodSelector selected={selected} onSelect={setSelected} />

                    <MoodNote note={note} onChange={setNote} />

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
                            className={`rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-all duration-200 ${selected && !saving
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

            {/* Right: Recent Moods + Summary */}
            <section className="lg:col-span-2 space-y-4">
                <RecentMoods recentMoods={recentMoods} loading={loading} />
                <MoodSummary weeklySummary={weeklySummary} loading={loading} />
            </section>
        </div>
    );
}

export default Mood;