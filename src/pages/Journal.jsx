import { useState } from "react";
import axios from "axios";
import { auth, db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Journal() {
    const [journalText, setJournalText] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSaveJournal = async () => {
        try {
            const user = auth.currentUser;

            if (!user) {
                alert("You are not logged in");
                return;
            }

            if (!journalText.trim()) {
                alert("Please write something in your journal");
                return;
            }

            setLoading(true);

            const aiResponse = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/analyze-journal`, {
                text: journalText,
            });

            const { emotion, stressLevel, reflection, suggestion } = aiResponse.data;

            await addDoc(collection(db, "journals"), {
                userId: user.uid,
                text: journalText,
                emotion,
                stressLevel,
                reflection,
                suggestion,
                createdAt: serverTimestamp(),
            });

            setJournalText("");
            navigate("/home");
        } catch (error) {
            console.error("Error saving journal:", error);
            alert(
                error.response?.data?.details ||
                error.response?.data?.error ||
                "Failed to save journal"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="mx-auto w-full max-w-4xl space-y-3 sm:space-y-4">
            <header className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6 md:p-7">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-500 sm:text-xs">Guided Journal</p>
                <h1 className="mt-1.5 text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">
                    Journal Reflection
                </h1>
                <p className="mt-1.5 text-xs text-gray-500 sm:text-sm md:text-base">
                    Write what is on your mind. The AI will respond with a gentle reflection.
                </p>
            </header>

            <div className="w-full rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5 md:p-7">
                <label className="text-xs font-medium text-gray-600 sm:text-sm">Your reflection</label>

                <textarea
                    value={journalText}
                    onChange={(e) => setJournalText(e.target.value)}
                    placeholder="Write your thoughts here..."
                    rows="8"
                    className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none transition focus:ring-2 focus:ring-violet-300"
                />

                <div className="mt-5 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
                    <button
                        onClick={() => navigate("/home")}
                        className="rounded-xl bg-gray-100 px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
                    >
                        Back to dashboard
                    </button>

                    <button
                        onClick={handleSaveJournal}
                        disabled={loading}
                        className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-violet-700 disabled:opacity-60"
                    >
                        {loading ? "Analyzing..." : "Save journal"}
                    </button>
                </div>
            </div>
        </section>
    );
}

export default Journal;