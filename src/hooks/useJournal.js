import { useEffect, useState } from "react";
import { fetchRecentJournals } from "../services/journalService";

export default function useJournal(userId) {
    const [recentJournals, setRecentJournals] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadJournalData = async () => {
        if (!userId) return;
        try {
            setLoading(true);
            const journals = await fetchRecentJournals(userId);
            setRecentJournals(journals);
        } catch (e) {
            console.error("Error loading journal data:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadJournalData();
    }, [userId]);

    return { recentJournals, loading, refetch: loadJournalData };
}
