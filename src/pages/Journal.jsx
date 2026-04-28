import { useState } from "react";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { JOURNAL_PROMPTS } from "../utils/constants";
import { analyzeJournal, saveJournalToFirestore } from "../services/journalService";

function Journal() {
    const [journalText, setJournalText] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const today = new Date();
    const prompt = JOURNAL_PROMPTS[today.getDate() % JOURNAL_PROMPTS.length];
    const charCount = journalText.length;

    const handleSaveJournal = async () => {
        try {
            const user = auth.currentUser;
            if (!user) return;
            if (!journalText.trim()) return;

            setLoading(true);

            const analysis = await analyzeJournal(journalText);

            await saveJournalToFirestore(user.uid, journalText, analysis);

            setJournalText("");
            navigate("/home");
        } catch (error) {
            console.error("Error saving journal:", error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="mx-auto w-full max-w-4xl space-y-4">
            <header className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-xl shadow-md">
                        📝
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-500 sm:text-xs">
                            Guided Journal
                        </p>
                        <h1 className="mt-0.5 text-xl font-bold text-gray-900 sm:text-2xl">
                            Journal Reflection
                        </h1>
                    </div>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-gray-500 sm:text-base">
                    Write freely. Your AI companion will respond with a gentle, private reflection.
                </p>

                <div className="mt-4 rounded-2xl border border-violet-100 bg-violet-50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-500">
                        Today's Prompt
                    </p>
                    <p className="mt-1.5 text-sm font-semibold leading-relaxed text-violet-900 sm:text-base">
                        {prompt}
                    </p>
                </div>
            </header>

            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
                <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-700">
                        Your reflection
                    </label>
                    <span className={`text-xs font-medium ${charCount > 0 ? "text-violet-500" : "text-gray-300"}`}>
                        {charCount} characters
                    </span>
                </div>

                <textarea
                    value={journalText}
                    onChange={(e) => setJournalText(e.target.value)}
                    placeholder="Start writing here…"
                    rows="9"
                    className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm leading-relaxed text-gray-800 outline-none placeholder:text-gray-400 transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100 sm:text-base"
                    disabled={loading}
                />

                {loading && (
                    <div className="mt-3 flex items-center gap-3 rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3">
                        <div className="flex gap-1">
                            <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400" style={{ animationDelay: "0ms" }} />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400" style={{ animationDelay: "150ms" }} />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400" style={{ animationDelay: "300ms" }} />
                        </div>
                        <p className="text-sm font-medium text-violet-700">
                            Analyzing your reflection…
                        </p>
                    </div>
                )}

                <div className="mt-5 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-between sm:items-center">
                    <button
                        onClick={() => navigate("/home")}
                        className="rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-200"
                        disabled={loading}
                    >
                        ← Back
                    </button>

                    <button
                        onClick={handleSaveJournal}
                        disabled={loading || !journalText.trim()}
                        className={`rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-all duration-200 ${!loading && journalText.trim()
                                ? "bg-gradient-to-r from-violet-500 to-indigo-600 shadow-md shadow-violet-200 hover:shadow-lg hover:shadow-violet-200 hover:-translate-y-0.5"
                                : "bg-gray-300 cursor-not-allowed"
                            }`}
                    >
                        {loading ? "Analyzing…" : "Save & Reflect ✨"}
                    </button>
                </div>
            </div>
        </section>
    );
}

export default Journal;