import { useState } from "react";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { JOURNAL_PROMPTS } from "../utils/constants";
import { analyzeJournal, saveJournalToFirestore } from "../services/journalService";
import useJournal from "../hooks/useJournal";
import JournalHeader from "../components/journal/JournalHeader";
import JournalEditor from "../components/journal/JournalEditor";
import RecentJournals from "../components/journal/RecentJournals";

function Journal() {
    const [journalText, setJournalText] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const user = auth.currentUser;
    const { recentJournals, refetch } = useJournal(user?.uid);

    const today = new Date();
    const prompt = JOURNAL_PROMPTS[today.getDate() % JOURNAL_PROMPTS.length];

    const handleSaveJournal = async () => {
        try {
            if (!user) return;
            if (!journalText.trim()) return;

            setLoading(true);

            const analysis = await analyzeJournal(journalText);

            await saveJournalToFirestore(user.uid, journalText, analysis);

            setJournalText("");
            // Refetch recent journals after saving
            await refetch();
        } catch (error) {
            console.error("Error saving journal:", error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            {/* Left: Journal Editor */}
            <section className="lg:col-span-3 space-y-4">
                <JournalHeader prompt={prompt} />
                <JournalEditor
                    journalText={journalText}
                    onChange={setJournalText}
                    loading={loading}
                    onSave={handleSaveJournal}
                    onBack={() => navigate("/home")}
                />
            </section>

            {/* Right: Recent Journals */}
            <section className="lg:col-span-2">
                <RecentJournals recentJournals={recentJournals} loading={loading} />
            </section>
        </div>
    );
}

export default Journal;