import axios from "axios";
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
import { API_BASE_URL } from "../utils/constants";

export async function analyzeJournal(text) {
    const response = await axios.post(`${API_BASE_URL}/analyze-journal`, {
        text,
    });

    return response.data;
}

export async function saveJournalToFirestore(userId, journalText, analysis) {
    return await addDoc(collection(db, "journals"), {
        userId,
        text: journalText,
        emotion: analysis.emotion,
        stressLevel: analysis.stressLevel,
        reflection: analysis.reflection,
        suggestion: analysis.suggestion,
        createdAt: serverTimestamp(),
    });
}

export async function deleteJournalById(id) {
    return await deleteDoc(doc(db, "journals", id));
}

export async function updateJournalById(id, updates) {
    return await updateDoc(doc(db, "journals", id), {
        ...updates,
        updatedAt: serverTimestamp(),
    });
}

/**
 * Fetch recent journals for a user (latest 3).
 */
export async function fetchRecentJournals(userId) {
    const q = query(
        collection(db, "journals"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(3)
    );
    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));
}