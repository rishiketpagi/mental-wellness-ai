import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchHomeData, deleteMoodById, updateMoodById, deleteJournalById, updateJournalById } from "../services/homeServices";

export default function useHomeData() {
    const { user } = useAuth();
    const [moods, setMoods] = useState([]);
    const [journals, setJournals] = useState([]);

    /* edit state — moods */
    const [editingMoodId, setEditingMoodId] = useState(null);
    const [editMoodValue, setEditMoodValue] = useState("");
    const [editMoodNote, setEditMoodNote] = useState("");

    /* edit state — journals */
    const [editingJournalId, setEditingJournalId] = useState(null);
    const [editJournalText, setEditJournalText] = useState("");

    /* fetch data */
    useEffect(() => {
        if (!user) return;
        const load = async () => {
            try {
                const data = await fetchHomeData(user.uid);
                setMoods(data.moods);
                setJournals(data.journals);
            } catch (e) {
                console.error(e);
            }
        };
        load();
    }, [user]);

    /* ── Mood CRUD ── */
    const handleDeleteMood = async (id) => {
        try {
            await deleteMoodById(id);
            setMoods((p) => p.filter((m) => m.id !== id));
        } catch (e) {
            console.error(e);
        }
    };

    const handleStartEditMood = (m) => {
        setEditingMoodId(m.id);
        setEditMoodValue(m.mood);
        setEditMoodNote(m.note || "");
    };

    const handleCancelEditMood = () => {
        setEditingMoodId(null);
        setEditMoodValue("");
        setEditMoodNote("");
    };

    const handleSaveEditMood = async (id) => {
        try {
            await updateMoodById(id, editMoodValue, editMoodNote);
            setMoods((p) =>
                p.map((m) =>
                    m.id === id ? { ...m, mood: editMoodValue, note: editMoodNote } : m
                )
            );
            handleCancelEditMood();
        } catch (e) {
            console.error(e);
        }
    };

    /* ── Journal CRUD ── */
    const handleDeleteJournal = async (id) => {
        try {
            await deleteJournalById(id);
            setJournals((p) => p.filter((j) => j.id !== id));
        } catch (e) {
            console.error(e);
        }
    };

    const handleStartEditJournal = (j) => {
        setEditingJournalId(j.id);
        setEditJournalText(j.text || "");
    };

    const handleCancelEditJournal = () => {
        setEditingJournalId(null);
        setEditJournalText("");
    };

    const handleSaveEditJournal = async (id) => {
        try {
            await updateJournalById(id, editJournalText);
            setJournals((p) =>
                p.map((j) =>
                    j.id === id ? { ...j, text: editJournalText } : j
                )
            );
            handleCancelEditJournal();
        } catch (e) {
            console.error(e);
        }
    };

    return {
        user,
        moods,
        journals,
        /* mood editing */
        editingMoodId,
        editMoodValue,
        setEditMoodValue,
        editMoodNote,
        setEditMoodNote,
        handleDeleteMood,
        handleStartEditMood,
        handleCancelEditMood,
        handleSaveEditMood,
        /* journal editing */
        editingJournalId,
        editJournalText,
        setEditJournalText,
        handleDeleteJournal,
        handleStartEditJournal,
        handleCancelEditJournal,
        handleSaveEditJournal,
    };
}
