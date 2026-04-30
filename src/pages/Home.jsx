import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import useHomeData from "../hooks/useHomeData";
import { QUOTES, getMoodStyle, getMoodInsight, getDailyStreak, getWeeklyDominant } from "../utils/homeUtils";
import MoodChart from "../components/MoodChart";
import HomeHero from "../components/home/HomeHero";
import HomeQuickActions from "../components/home/QuickActions";
import HomeStats from "../components/home/StatsSection";
import InsightCard from "../components/home/InsightCard";
import RecentMoods from "../components/home/RecentMoods";
import RecentJournals from "../components/home/RecentJournals";
import MobileQuote from "../components/home/MobileQuote";

function Home() {
    const navigate = useNavigate();
    const {
        user, moods, journals,
        editingMoodId, editMoodValue, setEditMoodValue, editMoodNote, setEditMoodNote,
        handleDeleteMood, handleStartEditMood, handleCancelEditMood, handleSaveEditMood,
        editingJournalId, editJournalText, setEditJournalText,
        handleDeleteJournal, handleStartEditJournal, handleCancelEditJournal, handleSaveEditJournal,
    } = useHomeData();

    const handleLogout = async () => {
        try { await signOut(auth); navigate("/"); } catch (e) { console.error(e); }
    };

    /* derived */
    const dailyQuote = QUOTES[new Date().getDate() % QUOTES.length];
    const latestMood = moods[0] ?? null;
    const moodStyle = latestMood ? getMoodStyle(latestMood.mood) : null;
    const insight = getMoodInsight(moods);
    const streak = getDailyStreak(moods);
    const weeklyMood = getWeeklyDominant(moods);
    const initial = user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";

    return (
        <div className="space-y-3 sm:space-y-4">
            <HomeHero
                user={user} initial={initial} latestMood={latestMood}
                moodStyle={moodStyle} streak={streak} moods={moods}
                journals={journals} dailyQuote={dailyQuote}
                onChat={() => navigate("/chat")} onLogout={handleLogout}
            />

            <HomeQuickActions navigate={navigate} />

            <HomeStats moods={moods} journals={journals} streak={streak} weeklyMood={weeklyMood} />

            <InsightCard insight={insight} />

            {/* Mood chart */}
            <section className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-extrabold text-indigo-700 sm:text-base">Mood Trend</h2>
                    <div className="flex gap-1.5">
                        <button onClick={() => navigate("/mood")} className="rounded-xl bg-indigo-100 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-200">+ Log</button>
                        <button onClick={() => navigate("/mood")} className="rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100">View all →</button>
                    </div>
                </div>
                <MoodChart moods={moods} />
            </section>

            <RecentMoods
                moods={moods} navigate={navigate}
                editingMoodId={editingMoodId} editMoodValue={editMoodValue}
                setEditMoodValue={setEditMoodValue} editMoodNote={editMoodNote}
                setEditMoodNote={setEditMoodNote} onStartEdit={handleStartEditMood}
                onCancelEdit={handleCancelEditMood} onSaveEdit={handleSaveEditMood}
                onDelete={handleDeleteMood}
            />

            <RecentJournals
                journals={journals} navigate={navigate}
                editingJournalId={editingJournalId} editJournalText={editJournalText}
                setEditJournalText={setEditJournalText} onStartEdit={handleStartEditJournal}
                onCancelEdit={handleCancelEditJournal} onSaveEdit={handleSaveEditJournal}
                onDelete={handleDeleteJournal}
            />

            <MobileQuote dailyQuote={dailyQuote} navigate={navigate} />
        </div>
    );
}

export default Home;