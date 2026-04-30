import { useEffect, useState } from "react";
import { fetchRecentMoods, getWeeklyMoodSummary } from "../services/moodService";

export default function useMood(userId) {
    const [recentMoods, setRecentMoods] = useState([]);
    const [weeklySummary, setWeeklySummary] = useState(null);
    const [loading, setLoading] = useState(false);

    const loadMoodData = async () => {
        if (!userId) return;
        try {
            setLoading(true);
            const [moods, summary] = await Promise.all([
                fetchRecentMoods(userId),
                getWeeklyMoodSummary(userId),
            ]);
            setRecentMoods(moods);
            setWeeklySummary(summary);
        } catch (e) {
            console.error("Error loading mood data:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMoodData();
    }, [userId]);

    return { recentMoods, weeklySummary, loading, refetch: loadMoodData };
}
