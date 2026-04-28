import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export async function saveMoodToFirestore(userId, mood, note) {
    return await addDoc(collection(db, "moods"), {
        userId,
        mood,
        note,
        createdAt: serverTimestamp(),
    });
}