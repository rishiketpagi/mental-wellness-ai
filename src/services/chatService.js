import axios from "axios";
import { db } from "../firebase";
import {
    collection,
    addDoc,
    serverTimestamp,
    query,
    where,
    getDocs,
    orderBy,
    deleteDoc,
    doc,
} from "firebase/firestore";
import { API_BASE_URL } from "../utils/constants";

export async function fetchChatMessages(userId) {
    const q = query(
        collection(db, "chats"),
        where("userId", "==", userId),
        orderBy("createdAt", "asc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function saveMessage(userId, sender, text) {
    return await addDoc(collection(db, "chats"), {
        userId,
        sender,
        text,
        createdAt: serverTimestamp(),
    });
}

export async function sendChatMessage(message) {
    const response = await axios.post(`${API_BASE_URL}/chat`, { message });
    return response.data.reply;
}

export async function clearAllMessages(userId) {
    const q = query(collection(db, "chats"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    await Promise.all(
        snapshot.docs.map((chatDoc) => deleteDoc(doc(db, "chats", chatDoc.id)))
    );
}

export function isCrisisReply(text) {
    if (!text) return false;
    const lower = text.toLowerCase();
    return (
        lower.includes("tele-manas") ||
        lower.includes("14416") ||
        lower.includes("1800-89-14416") ||
        lower.includes("immediate human support")
    );
}
