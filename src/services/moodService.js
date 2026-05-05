import {
    collection,
    addDoc,
    serverTimestamp,
    query,
    where,
    getDocs,
    orderBy,
    limit,
    deleteDoc,
    doc,
    updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";

export async function saveMoodToFirestore(userId, mood, note) {
    return await addDoc(collection(db, "moods"), {
        userId,
        mood,
        note,
        createdAt: serverTimestamp(),
    });
}

export async function deleteMoodById(id) {
    return await deleteDoc(doc(db, "moods", id));
}

export async function updateMoodById(id, updates) {
    return await updateDoc(doc(db, "moods", id), {
        ...updates,
        updatedAt: serverTimestamp(),
    });
}

/**
 * Fetch recent moods for a user (latest 5).
 */
export async function fetchRecentMoods(userId) {
    const q = query(
        collection(db, "moods"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(5)
    );
    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));
}

/**
 * Get weekly mood summary (last 7 days).
 * Returns total count and dominant mood.
 */
export async function getWeeklyMoodSummary(userId) {
    const q = query(
        collection(db, "moods"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(100) // Get enough to cover last 7 days
    );
    const snap = await getDocs(q);
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const weeklyMoods = snap.docs
        .map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }))
        .filter((mood) => mood.createdAt && mood.createdAt.toDate() >= sevenDaysAgo);

    const moodCounts = {};
    weeklyMoods.forEach((mood) => {
        moodCounts[mood.mood] = (moodCounts[mood.mood] || 0) + 1;
    });

    const dominantMood = Object.entries(moodCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || null;

    return {
        total: weeklyMoods.length,
        dominantMood,
        breakdown: moodCounts,
    };
}