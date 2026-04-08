import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MoodChart from "../components/MoodChart";
import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
    deleteDoc,
    updateDoc,
    doc,
} from "firebase/firestore";

function Home() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [moods, setMoods] = useState([]);
    const [journals, setJournals] = useState([]);
    const [editingMoodId, setEditingMoodId] = useState(null);
    const [editMoodValue, setEditMoodValue] = useState("");
    const [editMoodNote, setEditMoodNote] = useState("");
    const [editingJournalId, setEditingJournalId] = useState(null);
    const [editJournalText, setEditJournalText] = useState("");

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("/");
        } catch (error) {
            console.error(error.message);
        }
    };

    const handleDeleteMood = async (id) => {
        try {
            await deleteDoc(doc(db, "moods", id));
            setMoods((prev) => prev.filter((item) => item.id !== id));
        } catch (error) {
            console.error("Delete mood error:", error.message);
            alert("Failed to delete mood");
        }
    };
    const handleStartEditMood = (moodItem) => {
        setEditingMoodId(moodItem.id);
        setEditMoodValue(moodItem.mood);
        setEditMoodNote(moodItem.note || "");
    };

    const handleCancelEditMood = () => {
        setEditingMoodId(null);
        setEditMoodValue("");
        setEditMoodNote("");
    };

    const handleSaveEditMood = async (id) => {
        try {
            await updateDoc(doc(db, "moods", id), {
                mood: editMoodValue,
                note: editMoodNote,
            });

            setMoods((prev) =>
                prev.map((item) =>
                    item.id === id
                        ? { ...item, mood: editMoodValue, note: editMoodNote }
                        : item
                )
            );

            handleCancelEditMood();
        } catch (error) {
            console.error("Edit mood error:", error.message);
            alert("Failed to update mood");
        }
    };

    const handleDeleteJournal = async (id) => {
        try {
            await deleteDoc(doc(db, "journals", id));
            setJournals((prev) => prev.filter((item) => item.id !== id));
        } catch (error) {
            console.error("Delete journal error:", error.message);
            alert("Failed to delete journal");
        }
    };
    const handleStartEditJournal = (journalItem) => {
        setEditingJournalId(journalItem.id);
        setEditJournalText(journalItem.text || "");
    };

    const handleCancelEditJournal = () => {
        setEditingJournalId(null);
        setEditJournalText("");
    };

    const handleSaveEditJournal = async (id) => {
        try {
            await updateDoc(doc(db, "journals", id), {
                text: editJournalText,
            });

            setJournals((prev) =>
                prev.map((item) =>
                    item.id === id
                        ? { ...item, text: editJournalText }
                        : item
                )
            );

            handleCancelEditJournal();
        } catch (error) {
            console.error("Edit journal error:", error.message);
            alert("Failed to update journal");
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return "No date available";

        const date = timestamp.toDate();

        return date.toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    };

    const fetchMoods = async () => {
        try {
            if (!user) return;

            const q = query(
                collection(db, "moods"),
                where("userId", "==", user.uid),
                orderBy("createdAt", "desc")
            );

            const snapshot = await getDocs(q);
            const moodData = snapshot.docs.map((item) => ({
                id: item.id,
                ...item.data(),
            }));

            setMoods(moodData);
        } catch (error) {
            console.error("Mood fetch error:", error.message);
        }
    };

    const fetchJournals = async () => {
        try {
            if (!user) return;

            const q = query(
                collection(db, "journals"),
                where("userId", "==", user.uid),
                orderBy("createdAt", "desc")
            );

            const snapshot = await getDocs(q);
            const journalData = snapshot.docs.map((item) => ({
                id: item.id,
                ...item.data(),
            }));

            setJournals(journalData);
        } catch (error) {
            console.error("Journal fetch error:", error.message);
        }
    };

    useEffect(() => {
        if (user) {
            fetchMoods();
            fetchJournals();
        }
    }, [user]);

    const getMoodStyle = (mood) => {
        const m = mood?.toLowerCase();

        if (m === "happy") {
            return {
                emoji: "😊",
                bg: "bg-green-50",
                border: "border-green-200",
                text: "text-green-800",
                badge: "bg-green-100 text-green-700",
            };
        }

        if (m === "sad") {
            return {
                emoji: "😔",
                bg: "bg-blue-50",
                border: "border-blue-200",
                text: "text-blue-800",
                badge: "bg-blue-100 text-blue-700",
            };
        }

        if (m === "stressed") {
            return {
                emoji: "😣",
                bg: "bg-red-50",
                border: "border-red-200",
                text: "text-red-800",
                badge: "bg-red-100 text-red-700",
            };
        }

        return {
            emoji: "😐",
            bg: "bg-yellow-50",
            border: "border-yellow-200",
            text: "text-yellow-800",
            badge: "bg-yellow-100 text-yellow-700",
        };
    };

    const getMoodInsight = () => {
        if (moods.length === 0) {
            return {
                title: "No insights yet",
                message: "Start logging your mood to get gentle pattern-based insights.",
                color: "bg-gray-50 border-gray-200 text-gray-700",
            };
        }

        const recentMoods = moods.slice(0, 5).map((item) => item.mood?.toLowerCase());

        const stressedCount = recentMoods.filter((m) => m === "stressed").length;
        const sadCount = recentMoods.filter((m) => m === "sad").length;
        const happyCount = recentMoods.filter((m) => m === "happy").length;
        const neutralCount = recentMoods.filter((m) => m === "neutral").length;

        if (stressedCount >= 3) {
            return {
                title: "Stress pattern noticed",
                message:
                    "You’ve been feeling stressed in several recent check-ins. A short break, rest, hydration, or talking to someone you trust may help.",
                color: "bg-red-50 border-red-200 text-red-800",
            };
        }

        if (sadCount >= 3) {
            return {
                title: "Low mood trend noticed",
                message:
                    "You’ve logged several sad moods recently. Be gentle with yourself and consider reaching out to someone supportive.",
                color: "bg-blue-50 border-blue-200 text-blue-800",
            };
        }

        if (happyCount >= 3) {
            return {
                title: "Positive trend",
                message:
                    "Your recent mood check-ins look more positive. Keep noticing what’s helping and continue the habits that support you.",
                color: "bg-green-50 border-green-200 text-green-800",
            };
        }

        if (neutralCount >= 3) {
            return {
                title: "Steady pattern",
                message:
                    "Your recent moods look fairly steady. Small daily check-ins can help you notice changes early and stay balanced.",
                color: "bg-yellow-50 border-yellow-200 text-yellow-800",
            };
        }

        return {
            title: "Mixed emotional pattern",
            message:
                "Your recent moods are mixed, which is completely normal. Checking in regularly can help you understand what affects your emotional state.",
            color: "bg-violet-50 border-violet-200 text-violet-800",
        };
    };

    const getDailyStreak = () => {
        if (moods.length === 0) return 0;

        const uniqueDates = new Set(
            moods
                .filter((item) => item.createdAt)
                .map((item) => {
                    const date = item.createdAt.toDate();
                    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
                })
        );

        let streak = 0;
        const today = new Date();

        for (let i = 0; i < 365; i++) {
            const checkDate = new Date();
            checkDate.setDate(today.getDate() - i);

            const key = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;

            if (uniqueDates.has(key)) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    };

    const getWeeklySummary = () => {
        const counts = {
            Happy: 0,
            Neutral: 0,
            Sad: 0,
            Stressed: 0,
        };

        const now = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 6);

        const weeklyMoods = moods.filter((item) => {
            if (!item.createdAt) return false;
            const date = item.createdAt.toDate();
            return date >= sevenDaysAgo && date <= now;
        });

        weeklyMoods.forEach((item) => {
            if (counts[item.mood] !== undefined) {
                counts[item.mood]++;
            }
        });

        let dominantMood = "None";
        let maxCount = 0;

        Object.entries(counts).forEach(([mood, count]) => {
            if (count > maxCount) {
                maxCount = count;
                dominantMood = mood;
            }
        });

        let insight = "Log your mood more often this week to see patterns.";
        if (weeklyMoods.length > 0) {
            if (dominantMood === "Happy") {
                insight = "Your week looked more positive overall. Keep noticing what helped.";
            } else if (dominantMood === "Neutral") {
                insight = "Your week looked mostly steady. Small check-ins can reveal subtle changes.";
            } else if (dominantMood === "Sad") {
                insight = "This week seems emotionally heavy. Be gentle with yourself and seek support if needed.";
            } else if (dominantMood === "Stressed") {
                insight = "Stress appeared often this week. Rest, breaks, and support may help.";
            }
        }

        return {
            total: weeklyMoods.length,
            counts,
            dominantMood,
            insight,
        };
    };

    const getDailyWellnessCard = () => {
        const quotes = [
            "You do not need to solve everything today.",
            "Small steps still count as progress.",
            "Rest is not failure. It is part of healing.",
            "Your feelings are real, and they deserve care.",
            "It is okay to slow down and breathe.",
            "You are allowed to ask for support.",
            "A difficult day does not define your whole journey.",
        ];

        const prompts = [
            "What is one small thing that felt okay today?",
            "What has been taking most of your energy lately?",
            "What would help you feel 1% lighter today?",
            "What is one thought you want to let go of tonight?",
            "Who is one person you feel safe talking to?",
            "What is one kind thing you can do for yourself today?",
            "What helped you get through a hard moment recently?",
        ];

        const today = new Date();
        const dayIndex = today.getDate() % quotes.length;

        return {
            quote: quotes[dayIndex],
            prompt: prompts[dayIndex],
        };
    };

    const latestMood = moods.length > 0 ? moods[0] : null;
    const latestMoodStyle = latestMood ? getMoodStyle(latestMood.mood) : null;
    const moodInsight = getMoodInsight();
    const dailyStreak = getDailyStreak();
    const weeklySummary = getWeeklySummary();
    const dailyWellness = getDailyWellnessCard();

    const recentMoodPreview = moods.slice(0, 3);
    const recentJournalPreview = journals.slice(0, 2);

    return (
        <div className="page-wrap">
            {/* Header */}
            <section className="surface-card border-white/60">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="max-w-3xl">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-500 sm:text-xs">
                            Mental Wellness Dashboard
                        </p>

                        <h1 className="mt-1.5 text-2xl font-bold text-gray-900 sm:text-3xl">
                            Welcome back
                        </h1>

                        <p className="mt-2 text-sm leading-relaxed text-gray-500 sm:text-[15px]">
                            Track your emotions, reflect through journaling, and talk with your
                            AI support companion in one calm and private space.
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                            <span className="max-w-full break-all rounded-full bg-indigo-100 px-3 py-1.5 text-xs font-semibold text-indigo-700 sm:text-sm">
                                {user?.email || "Anonymous user"}
                            </span>

                            {latestMood ? (
                                <span
                                    className={`rounded-full px-3 py-1.5 text-xs font-semibold sm:text-sm ${latestMoodStyle.badge}`}
                                >
                                    Today: {latestMoodStyle.emoji} {latestMood.mood}
                                </span>
                            ) : (
                                <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 sm:text-sm">
                                    No mood logged yet
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                        <button
                            onClick={() => navigate("/chat")}
                            className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                        >
                            Open Chat
                        </button>

                        <button
                            onClick={handleLogout}
                            className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-200"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Daily Quote + Prompt */}
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-500">
                            Daily Quote
                        </p>
                        <p className="mt-2 text-base font-semibold leading-relaxed text-indigo-900 sm:text-lg">
                            “{dailyWellness.quote}”
                        </p>
                    </div>

                    <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-500">
                            Daily Prompt
                        </p>
                        <p className="mt-2 text-sm font-semibold leading-relaxed text-violet-900 sm:text-base">
                            {dailyWellness.prompt}
                        </p>

                        <button
                            onClick={() => navigate("/journal")}
                            className="mt-3 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-violet-700 sm:text-sm"
                        >
                            Reflect in Journal
                        </button>
                    </div>
                </div>
            </section>

            {/* Quick Actions */}
            <section>
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-4">
                    <button
                        onClick={() => navigate("/mood")}
                        className="rounded-2xl border border-gray-100 bg-white px-3 py-3 text-left shadow-sm transition hover:shadow-md"
                    >
                        <div className="text-xl">😊</div>
                        <h2 className="mt-2 text-sm font-semibold text-indigo-700 sm:text-base">
                            Mood Check-In
                        </h2>
                    </button>

                    <button
                        onClick={() => navigate("/journal")}
                        className="rounded-2xl border border-gray-100 bg-white px-3 py-3 text-left shadow-sm transition hover:shadow-md"
                    >
                        <div className="text-xl">📝</div>
                        <h2 className="mt-2 text-sm font-semibold text-violet-700 sm:text-base">
                            Journal Reflection
                        </h2>
                    </button>

                    <button
                        onClick={() => navigate("/chat")}
                        className="rounded-2xl border border-gray-100 bg-white px-3 py-3 text-left shadow-sm transition hover:shadow-md"
                    >
                        <div className="text-xl">💬</div>
                        <h2 className="mt-2 text-sm font-semibold text-emerald-700 sm:text-base">
                            Support Chat
                        </h2>
                    </button>

                    <button
                        onClick={() => navigate("/resources")}
                        className="rounded-2xl border border-gray-100 bg-white px-3 py-3 text-left shadow-sm transition hover:shadow-md"
                    >
                        <div className="text-xl">🌿</div>
                        <h2 className="mt-2 text-sm font-semibold text-teal-700 sm:text-base">
                            Resources
                        </h2>
                    </button>
                </div>
            </section>

            {/* Summary + Insight */}
            <section className="grid gap-4 xl:grid-cols-2">
                <div className="surface-card">
                    <h2 className="section-title text-gray-900">Your Overview</h2>
                    <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                        A quick snapshot of your recent activity
                    </p>

                    <div className="mt-3 grid grid-cols-2 gap-2.5 sm:gap-3">
                        <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3">
                            <p className="text-[11px] font-medium text-indigo-600 sm:text-xs">Mood Entries</p>
                            <h3 className="mt-1 text-xl font-bold text-indigo-800 sm:text-2xl">
                                {moods.length}
                            </h3>
                        </div>

                        <div className="rounded-xl border border-violet-100 bg-violet-50 p-3">
                            <p className="text-[11px] font-medium text-violet-600 sm:text-xs">Journal Entries</p>
                            <h3 className="mt-1 text-xl font-bold text-violet-800 sm:text-2xl">
                                {journals.length}
                            </h3>
                        </div>

                        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                            <p className="text-[11px] font-medium text-emerald-600 sm:text-xs">Latest Mood</p>
                            <h3 className="mt-1 text-lg font-bold text-emerald-800 sm:text-xl">
                                {latestMood ? latestMood.mood : "None"}
                            </h3>
                        </div>

                        <div className="rounded-xl border border-amber-100 bg-amber-50 p-3">
                            <p className="text-[11px] font-medium text-amber-600 sm:text-xs">Check-In Streak</p>
                            <h3 className="mt-1 text-lg font-bold text-amber-800 sm:text-xl">
                                {dailyStreak > 0
                                    ? `🔥 ${dailyStreak} day${dailyStreak === 1 ? "" : "s"}`
                                    : "Start today"}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className={`rounded-2xl border p-4 shadow-sm sm:p-5 ${moodInsight.color}`}>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                        AI Mood Insight
                    </p>
                    <h2 className="mt-1.5 text-lg font-bold sm:text-xl">{moodInsight.title}</h2>
                    <p className="mt-2 text-sm leading-relaxed sm:text-base">
                        {moodInsight.message}
                    </p>
                </div>
            </section>

            {/* Mood Graph */}
            <section className="surface-card">
                <div className="mb-3">
                    <h2 className="section-title text-indigo-700">
                        Your Emotional Trend
                    </h2>
                    <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                        Track how your mood has changed over time.
                    </p>
                </div>

                <MoodChart moods={moods} />
            </section>

            <section className="grid gap-3 lg:grid-cols-3">
                <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4 lg:col-span-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-600">
                        Weekly insight
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-gray-700 sm:text-base">{weeklySummary.insight}</p>
                </div>
                <div className="rounded-2xl border border-violet-100 bg-white p-4">
                    <p className="text-xs text-violet-600">Dominant mood</p>
                    <p className="mt-1.5 text-xl font-bold text-violet-800">
                        {weeklySummary.dominantMood === "Happy" && "😊 "}
                        {weeklySummary.dominantMood === "Neutral" && "😐 "}
                        {weeklySummary.dominantMood === "Sad" && "😔 "}
                        {weeklySummary.dominantMood === "Stressed" && "😣 "}
                        {weeklySummary.dominantMood}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 sm:text-sm">{weeklySummary.total} check-ins this week</p>
                </div>
            </section>

            {/* Preview Sections */}
            <section className="grid gap-4 xl:grid-cols-2">
                {/* Recent Moods Preview */}
                <div className="surface-card">
                    <div className="mb-3 flex items-center justify-between">
                        <div>
                            <h2 className="section-title text-indigo-700">
                                Recent Moods
                            </h2>
                            <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                                Showing your latest 3 check-ins
                            </p>
                        </div>

                        <button
                            onClick={() => navigate("/mood")}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 sm:text-sm"
                        >
                            Add new
                        </button>
                    </div>

                    {recentMoodPreview.length === 0 ? (
                        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-center">
                            <p className="text-gray-700 font-medium">No moods tracked yet</p>
                            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                                Start with a simple check-in today.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentMoodPreview.map((m) => {
                                const style = getMoodStyle(m.mood);
                                const isEditing = editingMoodId === m.id;

                                return (
                                    <div
                                        key={m.id}
                                        className={`rounded-2xl border p-3 sm:p-4 ${style.border} ${style.bg}`}
                                    >
                                        {isEditing ? (
                                            <div className="space-y-3">
                                                <select
                                                    value={editMoodValue}
                                                    onChange={(e) => setEditMoodValue(e.target.value)}
                                                    className="w-full rounded-xl border border-gray-300 px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-indigo-300"
                                                >
                                                    <option value="Happy">Happy</option>
                                                    <option value="Neutral">Neutral</option>
                                                    <option value="Sad">Sad</option>
                                                    <option value="Stressed">Stressed</option>
                                                </select>

                                                <textarea
                                                    value={editMoodNote}
                                                    onChange={(e) => setEditMoodNote(e.target.value)}
                                                    rows="3"
                                                    placeholder="Update your note..."
                                                    className="w-full rounded-xl border border-gray-300 px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-indigo-300"
                                                />

                                                <div className="flex gap-2 flex-wrap">
                                                    <button
                                                        onClick={() => handleSaveEditMood(m.id)}
                                                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 transition"
                                                    >
                                                        Save
                                                    </button>

                                                    <button
                                                        onClick={handleCancelEditMood}
                                                        className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 transition"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                <div className="min-w-0">
                                                    <div
                                                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold sm:text-sm ${style.badge}`}
                                                    >
                                                        <span className="text-lg">{style.emoji}</span>
                                                        <span>{m.mood}</span>
                                                    </div>

                                                    <p className="mt-2 text-sm leading-relaxed text-gray-700">
                                                        {m.note || "No note added"}
                                                    </p>

                                                    <p className="mt-2 text-xs text-gray-500">
                                                        {formatDate(m.createdAt)}
                                                    </p>
                                                </div>

                                                <div className="flex shrink-0 flex-row gap-2 sm:flex-col">
                                                    <button
                                                        onClick={() => handleStartEditMood(m)}
                                                        className="rounded-lg bg-white/80 px-3 py-1 text-sm text-indigo-700 border border-indigo-200 hover:bg-white transition"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        onClick={() => handleDeleteMood(m.id)}
                                                        className="rounded-lg bg-red-100 px-3 py-1 text-sm text-red-700 hover:bg-red-200 transition"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Recent Journals Preview */}
                <div className="surface-card">
                    <div className="mb-3 flex items-center justify-between">
                        <div>
                            <h2 className="section-title text-violet-700">
                                Recent Journals
                            </h2>
                            <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                                Showing your latest 2 reflections
                            </p>
                        </div>

                        <button
                            onClick={() => navigate("/journal")}
                            className="text-xs font-semibold text-violet-600 hover:text-violet-800 sm:text-sm"
                        >
                            Add new
                        </button>
                    </div>

                    {recentJournalPreview.length === 0 ? (
                        <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4 text-center">
                            <p className="text-gray-700 font-medium">No journal entries yet</p>
                            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                                Start writing your first reflection.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentJournalPreview.map((j) => {
                                const isEditing = editingJournalId === j.id;

                                return (
                                    <div
                                        key={j.id}
                                        className="rounded-2xl border border-violet-100 bg-violet-50 p-3 sm:p-4"
                                    >
                                        {isEditing ? (
                                            <div className="space-y-3">
                                                <textarea
                                                    value={editJournalText}
                                                    onChange={(e) => setEditJournalText(e.target.value)}
                                                    rows="6"
                                                    className="w-full rounded-xl border border-gray-300 px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-violet-300"
                                                    placeholder="Edit your journal..."
                                                />

                                                <div className="flex gap-2 flex-wrap">
                                                    <button
                                                        onClick={() => handleSaveEditJournal(j.id)}
                                                        className="rounded-lg bg-violet-600 px-4 py-2 text-sm text-white hover:bg-violet-700 transition"
                                                    >
                                                        Save
                                                    </button>

                                                    <button
                                                        onClick={handleCancelEditJournal}
                                                        className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 transition"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm leading-relaxed text-gray-800 sm:text-base">
                                                        {j.text}
                                                    </p>

                                                    <div className="mt-4 space-y-3">
                                                        <div className="rounded-xl bg-white/80 p-3">
                                                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                                Emotion
                                                            </p>
                                                            <p className="text-gray-700 mt-1">
                                                                {j.emotion || "Not analyzed yet"}
                                                            </p>
                                                        </div>

                                                        <div className="rounded-xl bg-white/80 p-3">
                                                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                                Reflection
                                                            </p>
                                                            <p className="text-gray-700 mt-1 leading-relaxed">
                                                                {j.reflection || "No reflection yet"}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <p className="text-xs text-gray-500 mt-3">
                                                        {formatDate(j.createdAt)}
                                                    </p>
                                                </div>

                                                <div className="flex shrink-0 flex-row gap-2 sm:flex-col">
                                                    <button
                                                        onClick={() => handleStartEditJournal(j)}
                                                        className="rounded-lg bg-white/80 px-3 py-1 text-sm text-violet-700 border border-violet-200 hover:bg-white transition"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        onClick={() => handleDeleteJournal(j.id)}
                                                        className="rounded-lg bg-red-100 px-3 py-1 text-sm text-red-700 hover:bg-red-200 transition"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

export default Home;