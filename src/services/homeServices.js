import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
    deleteDoc,
    updateDoc,
    doc,
} from "firebase/firestore";
import { db } from "../firebase";

export async function fetchHomeData(userId) {
    const [moodsSnap, journalsSnap] = await Promise.all([
        getDocs(
            query(
                collection(db, "moods"),
                where("userId", "==", userId),
                orderBy("createdAt", "desc")
            )
        ),
        getDocs(
            query(
                collection(db, "journals"),
                where("userId", "==", userId),
                orderBy("createdAt", "desc")
            )
        ),
    ]);

    return {
        moods: moodsSnap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
        })),
        journals: journalsSnap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
        })),
    };
}

export async function deleteMoodById(id) {
    await deleteDoc(doc(db, "moods", id));
}

export async function updateMoodById(id, mood, note) {
    await updateDoc(doc(db, "moods", id), {
        mood,
        note,
    });
}

export async function deleteJournalById(id) {
    await deleteDoc(doc(db, "journals", id));
}

export async function updateJournalById(id, text) {
    await updateDoc(doc(db, "journals", id), {
        text,
    });
}