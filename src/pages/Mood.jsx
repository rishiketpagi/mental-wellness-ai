import { useState } from "react";
import { auth, db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Mood() {
    const navigate = useNavigate();
    const [note, setNote] = useState("");

    const saveMood = async (selectedMood) => {
        try {
            const user = auth.currentUser;

            if (!user) {
                alert("You are not logged in");
                return;
            }

            await addDoc(collection(db, "moods"), {
                userId: user.uid,
                mood: selectedMood,
                note,
                createdAt: serverTimestamp(),
            });

            setNote("");
            navigate("/home");
        } catch (error) {
            alert("Failed to save mood: " + error.message);
        }
    };

    return (
        <section className="mx-auto w-full max-w-3xl space-y-3 sm:space-y-4">
            <header className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6 md:p-7">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-500 sm:text-xs">Mood Check-In</p>
                <h1 className="mt-1.5 text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">
                    How are you feeling today?
                </h1>
                <p className="mt-1.5 text-xs text-gray-500 sm:text-sm md:text-base">
                    Choose a mood and add a short note if you want to capture context.
                </p>
            </header>

            <div className="w-full rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5 md:p-7">
                <label className="text-xs font-medium text-gray-600 sm:text-sm">Optional note</label>

                <textarea
                    placeholder="Write a short note... for example: I felt tired after classes today"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows="4"
                    className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none transition focus:ring-2 focus:ring-indigo-300"
                />

                <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
                    <button
                        onClick={() => saveMood("Happy")}
                        className="rounded-2xl bg-green-100 px-2 py-3 text-xs font-semibold text-green-800 transition hover:bg-green-200 sm:py-4 sm:text-sm"
                    >
                        😊 Happy
                    </button>

                    <button
                        onClick={() => saveMood("Neutral")}
                        className="rounded-2xl bg-yellow-100 px-2 py-3 text-xs font-semibold text-yellow-800 transition hover:bg-yellow-200 sm:py-4 sm:text-sm"
                    >
                        😐 Neutral
                    </button>

                    <button
                        onClick={() => saveMood("Sad")}
                        className="rounded-2xl bg-blue-100 px-2 py-3 text-xs font-semibold text-blue-800 transition hover:bg-blue-200 sm:py-4 sm:text-sm"
                    >
                        😔 Sad
                    </button>

                    <button
                        onClick={() => saveMood("Stressed")}
                        className="rounded-2xl bg-red-100 px-2 py-3 text-xs font-semibold text-red-800 transition hover:bg-red-200 sm:py-4 sm:text-sm"
                    >
                        😣 Stressed
                    </button>
                </div>

                <div className="mt-5 text-right">
                    <button
                        onClick={() => navigate("/home")}
                        className="rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
                    >
                        Back to dashboard
                    </button>
                </div>
            </div>
        </section>
    );
}

export default Mood;