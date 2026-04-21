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

/* ─── helpers ─────────────────────────────────────────────────────────────── */
const getMoodStyle = (mood) => {
    const m = mood?.toLowerCase();
    if (m === "happy")    return { emoji: "😊", bg: "bg-green-50",  border: "border-green-200",  badge: "bg-green-100 text-green-700"  };
    if (m === "sad")      return { emoji: "😔", bg: "bg-blue-50",   border: "border-blue-200",   badge: "bg-blue-100 text-blue-700"    };
    if (m === "stressed") return { emoji: "😣", bg: "bg-red-50",    border: "border-red-200",    badge: "bg-red-100 text-red-700"      };
    return                       { emoji: "😐", bg: "bg-yellow-50", border: "border-yellow-200", badge: "bg-yellow-100 text-yellow-700" };
};

const getMoodInsight = (moods) => {
    if (!moods.length) return {
        title: "No insights yet", message: "Log a mood to get started.",
        from: "from-gray-50", to: "to-white", border: "border-gray-200", label: "text-gray-500", body: "text-gray-700",
    };
    const recent = moods.slice(0, 5).map((m) => m.mood?.toLowerCase());
    const count  = (v) => recent.filter((m) => m === v).length;
    if (count("stressed") >= 3) return { title: "Stress noticed 😣", message: "Consider a short break or talking to someone.", from: "from-red-50",    to: "to-rose-50",    border: "border-red-200",    label: "text-red-500",    body: "text-red-900"    };
    if (count("sad")      >= 3) return { title: "Low mood trend 😔", message: "Be gentle with yourself — reach out if you need.", from: "from-blue-50",   to: "to-sky-50",     border: "border-blue-200",   label: "text-blue-500",   body: "text-blue-900"   };
    if (count("happy")    >= 3) return { title: "Positive trend 🎉", message: "Keep going — notice what's working for you.",       from: "from-green-50",  to: "to-emerald-50", border: "border-green-200",  label: "text-green-500",  body: "text-green-900"  };
    if (count("neutral")  >= 3) return { title: "Steady pattern 😐", message: "Daily check-ins help you notice early changes.",     from: "from-yellow-50", to: "to-amber-50",   border: "border-yellow-200", label: "text-yellow-500", body: "text-yellow-900" };
    return { title: "Mixed moods", message: "Completely normal — keep checking in regularly.", from: "from-violet-50", to: "to-indigo-50", border: "border-violet-200", label: "text-violet-500", body: "text-violet-900" };
};

const getDailyStreak = (moods) => {
    if (!moods.length) return 0;
    const dates = new Set(moods.filter((m) => m.createdAt).map((m) => {
        const d = m.createdAt.toDate(); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    }));
    let streak = 0;
    for (let i = 0; i < 365; i++) {
        const c = new Date(); c.setDate(c.getDate() - i);
        if (dates.has(`${c.getFullYear()}-${c.getMonth()}-${c.getDate()}`)) streak++; else break;
    }
    return streak;
};

const getWeeklyDominant = (moods) => {
    const counts = { Happy: 0, Neutral: 0, Sad: 0, Stressed: 0 };
    const ago = new Date(); ago.setDate(ago.getDate() - 6);
    moods.filter((m) => m.createdAt && m.createdAt.toDate() >= ago)
         .forEach((m) => { if (counts[m.mood] !== undefined) counts[m.mood]++; });
    let best = "None", max = 0;
    Object.entries(counts).forEach(([k, v]) => { if (v > max) { max = v; best = k; } });
    return best;
};

const QUOTES = [
    "You do not need to solve everything today.",
    "Small steps still count as progress.",
    "Rest is not failure. It is part of healing.",
    "Your feelings are real, and they deserve care.",
    "It is okay to slow down and breathe.",
    "You are allowed to ask for support.",
    "A difficult day does not define your whole journey.",
];

const formatDate = (ts) => {
    if (!ts) return "";
    return ts.toDate().toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

const QUICK_ACTIONS = [
    { emoji: "😊", label: "Mood",      path: "/mood",      color: "from-indigo-500 to-indigo-600"  },
    { emoji: "📝", label: "Journal",   path: "/journal",   color: "from-violet-500 to-violet-600"  },
    { emoji: "💬", label: "Chat",      path: "/chat",      color: "from-emerald-500 to-teal-600"   },
    { emoji: "🌿", label: "Resources", path: "/resources", color: "from-teal-500 to-cyan-600"      },
];

const MOOD_EMOJI = { Happy: "😊", Neutral: "😐", Sad: "😔", Stressed: "😣", None: "—" };

/* ─── Component ───────────────────────────────────────────────────────────── */
function Home() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [moods,    setMoods]    = useState([]);
    const [journals, setJournals] = useState([]);

    /* edit state */
    const [editingMoodId,    setEditingMoodId]    = useState(null);
    const [editMoodValue,    setEditMoodValue]    = useState("");
    const [editMoodNote,     setEditMoodNote]     = useState("");
    const [editingJournalId, setEditingJournalId] = useState(null);
    const [editJournalText,  setEditJournalText]  = useState("");

    const handleLogout = async () => { try { await signOut(auth); navigate("/"); } catch (e) { console.error(e); } };

    /* mood edit */
    const handleDeleteMood     = async (id) => { try { await deleteDoc(doc(db, "moods", id)); setMoods((p) => p.filter((m) => m.id !== id)); } catch(e){ console.error(e); } };
    const handleStartEditMood  = (m) => { setEditingMoodId(m.id); setEditMoodValue(m.mood); setEditMoodNote(m.note || ""); };
    const handleCancelEditMood = () =>  { setEditingMoodId(null); setEditMoodValue(""); setEditMoodNote(""); };
    const handleSaveEditMood   = async (id) => {
        try { await updateDoc(doc(db, "moods", id), { mood: editMoodValue, note: editMoodNote }); setMoods((p) => p.map((m) => m.id === id ? { ...m, mood: editMoodValue, note: editMoodNote } : m)); handleCancelEditMood(); }
        catch(e){ console.error(e); }
    };

    /* journal edit */
    const handleDeleteJournal     = async (id) => { try { await deleteDoc(doc(db, "journals", id)); setJournals((p) => p.filter((j) => j.id !== id)); } catch(e){ console.error(e); } };
    const handleStartEditJournal  = (j) => { setEditingJournalId(j.id); setEditJournalText(j.text || ""); };
    const handleCancelEditJournal = () =>  { setEditingJournalId(null); setEditJournalText(""); };
    const handleSaveEditJournal   = async (id) => {
        try { await updateDoc(doc(db, "journals", id), { text: editJournalText }); setJournals((p) => p.map((j) => j.id === id ? { ...j, text: editJournalText } : j)); handleCancelEditJournal(); }
        catch(e){ console.error(e); }
    };

    /* fetch */
    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            const [mSnap, jSnap] = await Promise.all([
                getDocs(query(collection(db, "moods"),    where("userId", "==", user.uid), orderBy("createdAt", "desc"))),
                getDocs(query(collection(db, "journals"), where("userId", "==", user.uid), orderBy("createdAt", "desc"))),
            ]);
            setMoods(mSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
            setJournals(jSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        };
        fetchData();
    }, [user]);

    /* derived */
    const dailyQuote  = QUOTES[new Date().getDate() % QUOTES.length];
    const latestMood  = moods[0] ?? null;
    const moodStyle   = latestMood ? getMoodStyle(latestMood.mood) : null;
    const insight     = getMoodInsight(moods);
    const streak      = getDailyStreak(moods);
    const weeklyMood  = getWeeklyDominant(moods);

    const initial = user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";

    /* ── render ──────────────────────────────────────────────────────────── */
    return (
        <div className="space-y-3 sm:space-y-4">

            {/* ── Hero ──────────────────────────────────────────────────── */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-5 text-white shadow-lg sm:p-7">
                {/* blobs */}
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-8 left-4 h-32 w-32 rounded-full bg-purple-400/20 blur-2xl" />

                <div className="relative">
                    {/* top row: avatar + buttons */}
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-base font-bold backdrop-blur-sm ring-2 ring-white/30 sm:h-12 sm:w-12 sm:text-xl">
                                {initial}
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-white/60">Welcome back</p>
                                <h1 className="text-lg font-extrabold leading-tight sm:text-2xl">
                                    {user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || "There"} 👋
                                </h1>
                            </div>
                        </div>
                        <div className="flex shrink-0 gap-2">
                            <button onClick={() => navigate("/chat")} className="rounded-xl bg-white/20 px-3 py-2 text-xs font-bold backdrop-blur-sm transition hover:bg-white/30 sm:px-4 sm:text-sm">
                                💬 Chat
                            </button>
                            <button onClick={handleLogout} className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-white/80 backdrop-blur-sm transition hover:bg-white/20 sm:px-4 sm:text-sm">
                                Logout
                            </button>
                        </div>
                    </div>

                    {/* quote — hidden on smallest screens, shown sm+ */}
                    <p className="mt-4 hidden text-sm font-medium italic text-white/75 sm:block">
                        "{dailyQuote}"
                    </p>

                    {/* stat pills */}
                    <div className="mt-4 flex flex-wrap gap-2">
                        {latestMood ? (
                            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                                {moodStyle.emoji} Feeling {latestMood.mood}
                            </span>
                        ) : (
                            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                                No mood yet
                            </span>
                        )}
                        {streak > 0 && (
                            <span className="rounded-full bg-amber-400/30 px-3 py-1 text-xs font-semibold text-amber-100">
                                🔥 {streak}d streak
                            </span>
                        )}
                        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                            {moods.length} moods · {journals.length} journals
                        </span>
                    </div>
                </div>
            </section>

            {/* ── Quick Actions ─────────────────────────────────────────── */}
            <section className="grid grid-cols-4 gap-2 sm:gap-3">
                {QUICK_ACTIONS.map((a) => (
                    <button
                        key={a.path}
                        onClick={() => navigate(a.path)}
                        className={`group flex flex-col items-center gap-1.5 rounded-2xl bg-gradient-to-br ${a.color} p-3 text-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md sm:gap-2 sm:p-4`}
                    >
                        <span className="text-xl transition-transform group-hover:scale-110 sm:text-2xl">{a.emoji}</span>
                        <span className="text-[11px] font-bold sm:text-xs">{a.label}</span>
                    </button>
                ))}
            </section>

            {/* ── Stats row ─────────────────────────────────────────────── */}
            <section className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                {[
                    { label: "Moods",   value: moods.length,    from: "from-indigo-100", to: "to-indigo-50", border: "border-indigo-100", lbl: "text-indigo-600", num: "text-indigo-800" },
                    { label: "Journals", value: journals.length, from: "from-violet-100", to: "to-violet-50", border: "border-violet-100", lbl: "text-violet-600", num: "text-violet-800" },
                    { label: "Streak",  value: streak > 0 ? `🔥 ${streak}d` : "—",      from: "from-amber-100",   to: "to-amber-50",   border: "border-amber-100",   lbl: "text-amber-600",   num: "text-amber-800"   },
                    { label: "This Week", value: `${MOOD_EMOJI[weeklyMood] || "—"} ${weeklyMood === "None" ? "—" : weeklyMood}`, from: "from-emerald-100", to: "to-emerald-50", border: "border-emerald-100", lbl: "text-emerald-600", num: "text-emerald-800" },
                ].map((s) => (
                    <div key={s.label} className={`rounded-2xl border bg-gradient-to-b ${s.from} ${s.to} ${s.border} p-3 sm:p-4`}>
                        <p className={`text-[11px] font-semibold ${s.lbl}`}>{s.label}</p>
                        <p className={`mt-1 text-xl font-extrabold ${s.num} sm:text-2xl`}>{s.value}</p>
                    </div>
                ))}
            </section>

            {/* ── AI Insight ────────────────────────────────────────────── */}
            <section className={`rounded-2xl border bg-gradient-to-br ${insight.from} ${insight.to} ${insight.border} p-4 sm:p-5`}>
                <p className={`text-[11px] font-bold uppercase tracking-widest ${insight.label}`}>AI Insight</p>
                <h2 className={`mt-1.5 text-base font-extrabold sm:text-lg ${insight.body}`}>{insight.title}</h2>
                <p className={`mt-1 text-sm leading-relaxed ${insight.body}`}>{insight.message}</p>
            </section>

            {/* ── Mood chart ────────────────────────────────────────────── */}
            <section className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-extrabold text-indigo-700 sm:text-base">Mood Trend</h2>
                    <button onClick={() => navigate("/mood")} className="rounded-xl bg-indigo-100 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-200">+ Log</button>
                </div>
                <MoodChart moods={moods} />
            </section>

            {/* ── Recent Moods ──────────────────────────────────────────── */}
            <section className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-extrabold text-indigo-700 sm:text-base">Recent Moods</h2>
                    <button onClick={() => navigate("/mood")} className="rounded-xl bg-indigo-100 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-200">+ Add</button>
                </div>

                {moods.length === 0 ? (
                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 text-center">
                        <p className="text-2xl">😊</p>
                        <p className="mt-1 text-sm font-semibold text-gray-700">No moods tracked yet</p>
                        <p className="text-xs text-gray-500">Start with a quick check-in.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {moods.slice(0, 3).map((m) => {
                            const s = getMoodStyle(m.mood);
                            const isEditing = editingMoodId === m.id;
                            return (
                                <div key={m.id} className={`rounded-2xl border p-3 ${s.border} ${s.bg} sm:p-4`}>
                                    {isEditing ? (
                                        <div className="space-y-2">
                                            <select value={editMoodValue} onChange={(e) => setEditMoodValue(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300">
                                                {["Happy", "Neutral", "Sad", "Stressed"].map((v) => <option key={v}>{v}</option>)}
                                            </select>
                                            <textarea value={editMoodNote} onChange={(e) => setEditMoodNote(e.target.value)} rows="2" placeholder="Update note..." className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300" />
                                            <div className="flex gap-2">
                                                <button onClick={() => handleSaveEditMood(m.id)} className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700">Save</button>
                                                <button onClick={handleCancelEditMood}           className="rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${s.badge}`}>{s.emoji} {m.mood}</span>
                                                    <span className="text-xs text-gray-400">{formatDate(m.createdAt)}</span>
                                                </div>
                                                {m.note && <p className="mt-1.5 line-clamp-1 text-xs text-gray-600 sm:line-clamp-2">{m.note}</p>}
                                            </div>
                                            <div className="flex shrink-0 gap-1.5">
                                                <button onClick={() => handleStartEditMood(m)}  className="rounded-xl border border-white/80 bg-white/80 px-2.5 py-1 text-xs font-bold text-indigo-700 hover:bg-white">Edit</button>
                                                <button onClick={() => handleDeleteMood(m.id)}  className="rounded-xl bg-red-100 px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-200">Del</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* ── Recent Journals ───────────────────────────────────────── */}
            <section className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-extrabold text-violet-700 sm:text-base">Recent Journals</h2>
                    <button onClick={() => navigate("/journal")} className="rounded-xl bg-violet-100 px-3 py-1.5 text-xs font-bold text-violet-700 hover:bg-violet-200">+ Add</button>
                </div>

                {journals.length === 0 ? (
                    <div className="rounded-2xl border border-violet-100 bg-violet-50 p-5 text-center">
                        <p className="text-2xl">📝</p>
                        <p className="mt-1 text-sm font-semibold text-gray-700">No journals yet</p>
                        <p className="text-xs text-gray-500">Write your first reflection.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {journals.slice(0, 2).map((j) => {
                            const isEditing = editingJournalId === j.id;
                            return (
                                <div key={j.id} className="rounded-2xl border border-violet-100 bg-gradient-to-b from-violet-50 to-white p-3 sm:p-4">
                                    {isEditing ? (
                                        <div className="space-y-2">
                                            <textarea value={editJournalText} onChange={(e) => setEditJournalText(e.target.value)} rows="4" className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-300" placeholder="Edit your journal..." />
                                            <div className="flex gap-2">
                                                <button onClick={() => handleSaveEditJournal(j.id)} className="rounded-xl bg-violet-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-violet-700">Save</button>
                                                <button onClick={handleCancelEditJournal}           className="rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    {j.emotion && <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-bold text-violet-700">{j.emotion}</span>}
                                                    <span className="text-xs text-gray-400">{formatDate(j.createdAt)}</span>
                                                </div>
                                                <p className="line-clamp-2 text-sm leading-relaxed text-gray-800">{j.text}</p>
                                                {j.reflection && <p className="mt-1 line-clamp-1 text-xs italic text-gray-500">"{j.reflection}"</p>}
                                            </div>
                                            <div className="flex shrink-0 flex-col gap-1.5">
                                                <button onClick={() => handleStartEditJournal(j)} className="rounded-xl border border-violet-200 bg-white/80 px-2.5 py-1 text-xs font-bold text-violet-700 hover:bg-white">Edit</button>
                                                <button onClick={() => handleDeleteJournal(j.id)} className="rounded-xl bg-red-100 px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-200">Del</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* ── Daily quote — visible only on mobile (sm hidden above) ── */}
            <section className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 p-4 sm:hidden">
                <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-400">Daily Quote</p>
                <p className="mt-1.5 text-sm font-semibold italic leading-relaxed text-indigo-900">"{dailyQuote}"</p>
                <button onClick={() => navigate("/journal")} className="mt-3 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700">
                    Reflect in Journal →
                </button>
            </section>

        </div>
    );
}

export default Home;