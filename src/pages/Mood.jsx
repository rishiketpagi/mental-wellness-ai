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
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-2xl rounded-3xl bg-white shadow-xl p-8 border border-gray-100">
                <h1 className="text-3xl font-bold text-center text-indigo-700">
                    How are you feeling today?
                </h1>
                <p className="text-center text-gray-500 mt-2">
                    Choose a mood and add a small note if you want
                </p>

                <textarea
                    placeholder="Write a short note... for example: I felt tired after classes today"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows="4"
                    className="w-full mt-6 rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-300"
                />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <button
                        onClick={() => saveMood("Happy")}
                        className="rounded-2xl bg-green-100 py-4 hover:bg-green-200 transition"
                    >
                        😊 Happy
                    </button>

                    <button
                        onClick={() => saveMood("Neutral")}
                        className="rounded-2xl bg-yellow-100 py-4 hover:bg-yellow-200 transition"
                    >
                        😐 Neutral
                    </button>

                    <button
                        onClick={() => saveMood("Sad")}
                        className="rounded-2xl bg-blue-100 py-4 hover:bg-blue-200 transition"
                    >
                        😔 Sad
                    </button>

                    <button
                        onClick={() => saveMood("Stressed")}
                        className="rounded-2xl bg-red-100 py-4 hover:bg-red-200 transition"
                    >
                        😣 Stressed
                    </button>
                </div>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => navigate("/home")}
                        className="rounded-xl bg-gray-100 px-5 py-3 text-gray-700 hover:bg-gray-200 transition"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Mood;