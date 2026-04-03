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
    doc,
} from "firebase/firestore";

function Home() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [moods, setMoods] = useState([]);
    const [journals, setJournals] = useState([]);

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

    const handleDeleteJournal = async (id) => {
        try {
            await deleteDoc(doc(db, "journals", id));
            setJournals((prev) => prev.filter((item) => item.id !== id));
        } catch (error) {
            console.error("Delete journal error:", error.message);
            alert("Failed to delete journal");
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
                    "You’ve been feeling stressed in several recent check-ins. A short break, hydration, rest, or talking to someone you trust may help.",
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


    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-violet-50 to-white px-4 py-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <section className="bg-white rounded-[28px] shadow-lg border border-white/60 p-6 md:p-8">
                    <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
                        <div className="max-w-3xl">
                            <p className="text-sm font-semibold tracking-wide text-indigo-500 uppercase">
                                Mental Wellness Dashboard
                            </p>

                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
                                Welcome back
                            </h1>

                            <p className="text-gray-500 mt-3 leading-relaxed">
                                Track your mood, reflect through journaling, and talk with your
                                AI support companion in one calm and private space.
                            </p>

                            <div className="mt-5 flex flex-wrap gap-3">
                                <span className="rounded-full bg-indigo-100 text-indigo-700 px-4 py-2 text-sm font-medium">
                                    {user?.email || "Anonymous user"}
                                </span>

                                {latestMood ? (
                                    <span
                                        className={`rounded-full px-4 py-2 text-sm font-medium ${latestMoodStyle.badge}`}
                                    >
                                        Today: {latestMoodStyle.emoji} {latestMood.mood}
                                    </span>
                                ) : (
                                    <span className="rounded-full bg-gray-100 text-gray-600 px-4 py-2 text-sm font-medium">
                                        No mood logged yet
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => navigate("/chat")}
                                className="rounded-2xl bg-emerald-600 text-white px-5 py-3 font-medium hover:bg-emerald-700 hover:shadow-md transition"
                            >
                                Open Chat
                            </button>

                            <button
                                onClick={handleLogout}
                                className="rounded-2xl bg-gray-100 text-gray-700 px-5 py-3 font-medium hover:bg-gray-200 transition"
                            >
                                Logout
                            </button>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-8">
                        <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-5">
                            <p className="text-sm text-indigo-600 font-medium">Mood Entries</p>
                            <h3 className="text-3xl font-bold text-indigo-800 mt-2">
                                {moods.length}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Your recorded check-ins
                            </p>
                        </div>

                        <div className="rounded-2xl bg-violet-50 border border-violet-100 p-5">
                            <p className="text-sm text-violet-600 font-medium">Journal Entries</p>
                            <h3 className="text-3xl font-bold text-violet-800 mt-2">
                                {journals.length}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Personal reflections saved
                            </p>
                        </div>

                        <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-5">
                            <p className="text-sm text-emerald-600 font-medium">Latest Mood</p>
                            <h3 className="text-2xl font-bold text-emerald-800 mt-2">
                                {latestMood ? latestMood.mood : "None"}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Most recent emotional check-in
                            </p>
                        </div>

                        <div className="rounded-2xl bg-amber-50 border border-amber-100 p-5">
                            <p className="text-sm text-amber-600 font-medium">Check-In Streak</p>
                            <h3 className="text-2xl font-bold text-amber-800 mt-2">
                                {dailyStreak > 0
                                    ? `🔥 ${dailyStreak} day${dailyStreak === 1 ? "" : "s"}`
                                    : "Start today"}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Consecutive days with mood check-ins
                            </p>
                        </div>                    </div>
                </section>
                <section
                    className={`rounded-[28px] border p-6 shadow-sm ${moodInsight.color}`}
                >
                    <p className="text-sm font-semibold uppercase tracking-wide">
                        AI Mood Insight
                    </p>
                    <h2 className="text-2xl font-bold mt-2">{moodInsight.title}</h2>
                    <p className="mt-3 leading-relaxed max-w-3xl">
                        {moodInsight.message}
                    </p>
                </section>
                {/* Quick Actions */}
                <section>
                    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
                        <button
                            onClick={() => navigate("/mood")}
                            className="bg-white rounded-[24px] shadow-lg border border-gray-100 p-6 text-left hover:shadow-xl hover:-translate-y-0.5 transition"
                        >
                            <div className="text-3xl">😊</div>
                            <h2 className="text-xl font-semibold text-indigo-700 mt-4">
                                Mood Check-In
                            </h2>
                            <p className="text-gray-500 mt-2 leading-relaxed">
                                Record how you’re feeling today and add a short personal note.
                            </p>
                        </button>

                        <button
                            onClick={() => navigate("/journal")}
                            className="bg-white rounded-[24px] shadow-lg border border-gray-100 p-6 text-left hover:shadow-xl hover:-translate-y-0.5 transition"
                        >
                            <div className="text-3xl">📝</div>
                            <h2 className="text-xl font-semibold text-violet-700 mt-4">
                                Journal Reflection
                            </h2>
                            <p className="text-gray-500 mt-2 leading-relaxed">
                                Write your thoughts and get a gentle AI reflection and support.
                            </p>
                        </button>

                        <button
                            onClick={() => navigate("/chat")}
                            className="bg-white rounded-[24px] shadow-lg border border-gray-100 p-6 text-left hover:shadow-xl hover:-translate-y-0.5 transition"
                        >
                            <div className="text-3xl">💬</div>
                            <h2 className="text-xl font-semibold text-emerald-700 mt-4">
                                Support Chat
                            </h2>
                            <p className="text-gray-500 mt-2 leading-relaxed">
                                Talk freely with your AI support companion whenever you need it.
                            </p>
                        </button>

                        <button
                            onClick={() => navigate("/resources")}
                            className="bg-white rounded-[24px] shadow-lg border border-gray-100 p-6 text-left hover:shadow-xl hover:-translate-y-0.5 transition"
                        >
                            <div className="text-3xl">🌿</div>
                            <h2 className="text-xl font-semibold text-teal-700 mt-4">
                                Resources
                            </h2>
                            <p className="text-gray-500 mt-2 leading-relaxed">
                                Explore grounding steps, coping ideas, and helpful wellness tips.
                            </p>
                        </button>
                    </div>
                </section>

                {/* Mood Graph */}
                <section className="bg-white rounded-[28px] shadow-lg border border-gray-100 p-6">
                    <div className="mb-5">
                        <h2 className="text-2xl font-semibold text-indigo-700">
                            Your Emotional Trend
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Track how your mood has changed over time.
                        </p>
                    </div>

                    <MoodChart moods={moods} />
                </section>
                <section className="bg-white rounded-[28px] shadow-lg border border-gray-100 p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                        <div className="max-w-2xl">
                            <p className="text-sm font-semibold tracking-wide text-violet-500 uppercase">
                                Weekly Summary
                            </p>
                            <h2 className="text-2xl font-bold text-gray-900 mt-2">
                                Your mood pattern this week
                            </h2>
                            <p className="text-gray-500 mt-2 leading-relaxed">
                                A quick snapshot of how your recent emotional check-ins have been going.
                            </p>
                        </div>

                        <div className="rounded-2xl bg-violet-50 border border-violet-100 px-5 py-4 min-w-[220px]">
                            <p className="text-sm text-violet-600 font-medium">Dominant Mood</p>
                            <p className="text-2xl font-bold text-violet-800 mt-2">
                                {weeklySummary.dominantMood === "Happy" && "😊 "}
                                {weeklySummary.dominantMood === "Neutral" && "😐 "}
                                {weeklySummary.dominantMood === "Sad" && "😔 "}
                                {weeklySummary.dominantMood === "Stressed" && "😣 "}
                                {weeklySummary.dominantMood}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                {weeklySummary.total} total check-ins this week
                            </p>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
                        <div className="rounded-2xl bg-green-50 border border-green-100 p-4">
                            <p className="text-sm text-green-600 font-medium">Happy</p>
                            <p className="text-3xl font-bold text-green-800 mt-2">
                                {weeklySummary.counts.Happy}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-yellow-50 border border-yellow-100 p-4">
                            <p className="text-sm text-yellow-600 font-medium">Neutral</p>
                            <p className="text-3xl font-bold text-yellow-800 mt-2">
                                {weeklySummary.counts.Neutral}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4">
                            <p className="text-sm text-blue-600 font-medium">Sad</p>
                            <p className="text-3xl font-bold text-blue-800 mt-2">
                                {weeklySummary.counts.Sad}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-red-50 border border-red-100 p-4">
                            <p className="text-sm text-red-600 font-medium">Stressed</p>
                            <p className="text-3xl font-bold text-red-800 mt-2">
                                {weeklySummary.counts.Stressed}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 rounded-2xl bg-gray-50 border border-gray-100 p-5">
                        <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                            Weekly Insight
                        </p>
                        <p className="text-gray-700 mt-2 leading-relaxed">
                            {weeklySummary.insight}
                        </p>
                    </div>
                </section>
                <section className="grid lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-[28px] shadow-lg border border-gray-100 p-6">
                        <p className="text-sm font-semibold tracking-wide text-indigo-500 uppercase">
                            Daily Quote
                        </p>
                        <h2 className="text-2xl font-bold text-gray-900 mt-2">
                            A gentle reminder for today
                        </h2>
                        <div className="mt-5 rounded-2xl bg-indigo-50 border border-indigo-100 p-5">
                            <p className="text-lg leading-relaxed text-indigo-900 font-medium">
                                “{dailyWellness.quote}”
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-[28px] shadow-lg border border-gray-100 p-6">
                        <p className="text-sm font-semibold tracking-wide text-violet-500 uppercase">
                            Daily Prompt
                        </p>
                        <h2 className="text-2xl font-bold text-gray-900 mt-2">
                            A small reflection for you
                        </h2>
                        <div className="mt-5 rounded-2xl bg-violet-50 border border-violet-100 p-5">
                            <p className="text-lg leading-relaxed text-violet-900 font-medium">
                                {dailyWellness.prompt}
                            </p>

                            <button
                                onClick={() => navigate("/journal")}
                                className="mt-4 rounded-xl bg-violet-600 text-white px-4 py-2 font-medium hover:bg-violet-700 transition"
                            >
                                Reflect in Journal
                            </button>
                        </div>
                    </div>
                </section>
                {/* Main Content */}
                <section className="grid xl:grid-cols-2 gap-6">
                    {/* Recent Moods */}
                    <div className="bg-white rounded-[28px] shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-2xl font-semibold text-indigo-700">
                                    Recent Moods
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Your latest emotional check-ins
                                </p>
                            </div>

                            <button
                                onClick={() => navigate("/mood")}
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                            >
                                Add new
                            </button>
                        </div>

                        {moods.length === 0 ? (
                            <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-6 text-center">
                                <p className="text-gray-700 font-medium">No moods tracked yet</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Start with a simple check-in today.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-[540px] overflow-y-auto pr-1">
                                {moods.map((m) => {
                                    const style = getMoodStyle(m.mood);

                                    return (
                                        <div
                                            key={m.id}
                                            className={`rounded-2xl border ${style.border} ${style.bg} p-4`}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="min-w-0">
                                                    <div
                                                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${style.badge}`}
                                                    >
                                                        <span className="text-lg">{style.emoji}</span>
                                                        <span>{m.mood}</span>
                                                    </div>

                                                    <p className="text-gray-700 mt-3 leading-relaxed">
                                                        {m.note || "No note added"}
                                                    </p>

                                                    <p className="text-xs text-gray-500 mt-3">
                                                        {formatDate(m.createdAt)}
                                                    </p>
                                                </div>

                                                <button
                                                    onClick={() => handleDeleteMood(m.id)}
                                                    className="shrink-0 rounded-lg bg-red-100 px-3 py-1 text-sm text-red-700 hover:bg-red-200 transition"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Recent Journals */}
                    <div className="bg-white rounded-[28px] shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-2xl font-semibold text-violet-700">
                                    Recent Journals
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Reflections with AI support
                                </p>
                            </div>

                            <button
                                onClick={() => navigate("/journal")}
                                className="text-sm font-medium text-violet-600 hover:text-violet-800"
                            >
                                Add new
                            </button>
                        </div>

                        {journals.length === 0 ? (
                            <div className="rounded-2xl bg-violet-50 border border-violet-100 p-6 text-center">
                                <p className="text-gray-700 font-medium">No journal entries yet</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Start writing your first reflection.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-[540px] overflow-y-auto pr-1">
                                {journals.map((j) => (
                                    <div
                                        key={j.id}
                                        className="rounded-2xl border border-violet-100 bg-violet-50 p-4"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-gray-800 leading-relaxed">
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
                                                            Stress Level
                                                        </p>
                                                        <p className="text-gray-700 mt-1">
                                                            {j.stressLevel || "Not analyzed yet"}
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

                                                    <div className="rounded-xl bg-white/80 p-3">
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                            Suggestion
                                                        </p>
                                                        <p className="text-gray-700 mt-1 leading-relaxed">
                                                            {j.suggestion || "No suggestion yet"}
                                                        </p>
                                                    </div>
                                                </div>

                                                <p className="text-xs text-gray-500 mt-3">
                                                    {formatDate(j.createdAt)}
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => handleDeleteJournal(j.id)}
                                                className="shrink-0 rounded-lg bg-red-100 px-3 py-1 text-sm text-red-700 hover:bg-red-200 transition"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default Home;