import axios from "axios";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
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