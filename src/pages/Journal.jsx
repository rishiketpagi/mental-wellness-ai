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

            const aiResponse = await axios.post("http://localhost:5000/analyze-journal", {
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
        <div className="min-h-screen flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-3xl rounded-3xl bg-white shadow-xl p-8 border border-gray-100">
                <h1 className="text-3xl font-bold text-center text-violet-700">
                    Journal Reflection
                </h1>
                <p className="text-center text-gray-500 mt-2">
                    Write what’s on your mind. The AI will offer a gentle reflection.
                </p>

                <textarea
                    value={journalText}
                    onChange={(e) => setJournalText(e.target.value)}
                    placeholder="Write your thoughts here..."
                    rows="10"
                    className="w-full mt-6 rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-violet-300"
                />

                <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                    <button
                        onClick={handleSaveJournal}
                        disabled={loading}
                        className="rounded-xl bg-violet-600 text-white px-6 py-3 hover:bg-violet-700 transition disabled:opacity-60"
                    >
                        {loading ? "Analyzing..." : "Save Journal"}
                    </button>

                    <button
                        onClick={() => navigate("/home")}
                        className="rounded-xl bg-gray-100 text-gray-700 px-6 py-3 hover:bg-gray-200 transition"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Journal;