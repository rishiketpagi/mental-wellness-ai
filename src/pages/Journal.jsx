import { useState } from "react";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { JOURNAL_PROMPTS } from "../utils/constants";
import {
    analyzeJournal,
    saveJournalToFirestore,
    deleteJournalById,
    updateJournalById,
} from "../services/journalService";
import useJournal from "../hooks/useJournal";
import JournalHeader from "../components/journal/JournalHeader";
import JournalEditor from "../components/journal/JournalEditor";
import RecentJournals from "../components/journal/RecentJournals";

function Journal() {
    const [journalText, setJournalText] = useState("");
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [selectedJournalId, setSelectedJournalId] = useState(null);
    const navigate = useNavigate();

    const user = auth.currentUser;
    const { recentJournals, loading: journalsLoading, refetch } = useJournal(user?.uid);
    const selectedJournal = recentJournals.find((journal) => journal.id === selectedJournalId) || null;

    const today = new Date();
    const prompt = JOURNAL_PROMPTS[today.getDate() % JOURNAL_PROMPTS.length];

    const handleSaveJournal = async () => {
        try {
            if (!user) return;
            if (!journalText.trim()) return;

            setLoading(true);

            const analysis = await analyzeJournal(journalText);

            if (editingId) {
                await updateJournalById(editingId, {
                    text: journalText,
                    emotion: analysis.emotion,
                    stressLevel: analysis.stressLevel,
                    reflection: analysis.reflection,
                    suggestion: analysis.suggestion,
                });
                setSelectedJournalId(editingId);
            } else {
                const journalRef = await saveJournalToFirestore(user.uid, journalText, analysis);
                setSelectedJournalId(journalRef.id);
            }

            setJournalText("");
            setEditingId(null);
            // Refetch recent journals after saving
            await refetch();
        } catch (error) {
            console.error("Error saving journal:", error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteJournal = async (id) => {
        try {
            await deleteJournalById(id);
            if (editingId === id) {
                setEditingId(null);
                setJournalText("");
            }
            if (selectedJournalId === id) {
                setSelectedJournalId(null);
            }
            await refetch();
        } catch (error) {
            console.error("Delete journal error:", error.message);
        }
    };

    const handleEditJournal = (journal) => {
        setEditingId(journal.id);
        setJournalText(journal.text || "");
        setSelectedJournalId(journal.id);
    };

    const handleSelectJournal = (journal) => {
        setSelectedJournalId(journal.id);
    };

    const handleClearSelectedJournal = () => {
        setSelectedJournalId(null);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setJournalText("");
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
                    isEditing={!!editingId}
                    onCancelEdit={cancelEdit}
                />
            </section>

            {/* Right: Recent Journals */}
            <section className="lg:col-span-2">
                <RecentJournals
                    recentJournals={recentJournals}
                    loading={journalsLoading}
                    selectedJournal={selectedJournal}
                    onSelect={handleSelectJournal}
                    onClearSelection={handleClearSelectedJournal}
                    onEdit={handleEditJournal}
                    onDelete={handleDeleteJournal}
                />
            </section>
        </div>
    );
}

export default Journal;