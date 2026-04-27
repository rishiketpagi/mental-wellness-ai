import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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

function Chat() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [clearing, setClearing] = useState(false);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchMessages = async () => {
        try {
            if (!user) return;
            const q = query(
                collection(db, "chats"),
                where("userId", "==", user.uid),
                orderBy("createdAt", "asc")
            );
            const snapshot = await getDocs(q);
            setMessages(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
        } catch (error) {
            console.error("Fetch chat error:", error.message);
        }
    };

    useEffect(() => { if (user) fetchMessages(); }, [user]);
    useEffect(() => { scrollToBottom(); }, [messages, loading]);

    const handleSend = async () => {
        if (!message.trim() || !user || loading) return;

        const currentMessage = message.trim();
        setMessage("");
        setLoading(true);

        try {
            await addDoc(collection(db, "chats"), {
                userId: user.uid,
                sender: "user",
                text: currentMessage,
                createdAt: serverTimestamp(),
            });
            setMessages((prev) => [...prev, { sender: "user", text: currentMessage }]);

            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/chat`, {
                message: currentMessage,
            });
            const aiReply = response.data.reply;

            await addDoc(collection(db, "chats"), {
                userId: user.uid,
                sender: "ai",
                text: aiReply,
                createdAt: serverTimestamp(),
            });
            setMessages((prev) => [...prev, { sender: "ai", text: aiReply }]);
        } catch (error) {
            console.error("Chat error:", error);
        } finally {
            setLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleClearChat = async () => {
        if (!user) return;
        setClearing(true);
        try {
            const q = query(collection(db, "chats"), where("userId", "==", user.uid));
            const snapshot = await getDocs(q);
            await Promise.all(snapshot.docs.map((chatDoc) => deleteDoc(doc(db, "chats", chatDoc.id))));
            setMessages([]);
        } catch (error) {
            console.error("Clear chat error:", error.message);
        } finally {
            setClearing(false);
        }
    };

    const isCrisisReply = (text) => {
        if (!text) return false;
        const lower = text.toLowerCase();
        return (
            lower.includes("tele-manas") ||
            lower.includes("14416") ||
            lower.includes("1800-89-14416") ||
            lower.includes("immediate human support")
        );
    };

    return (
        <div className="mx-auto w-full max-w-4xl space-y-4">
            {/* Header */}
            <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-xl shadow-md">
                            💬
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-500 sm:text-xs">
                                AI Support Space
                            </p>
                            <h1 className="mt-0.5 text-xl font-bold text-gray-900 sm:text-2xl">
                                Support Chat
                            </h1>
                            <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-gray-500">
                                Talk freely. Your AI companion is here to listen and respond with care.
                            </p>

                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setShowHelp((p) => !p)}
                            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${showHelp
                                    ? "bg-amber-600 text-white"
                                    : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                                }`}
                        >
                            🆘 {showHelp ? "Hide Help" : "Urgent Help"}
                        </button>
                        <button
                            onClick={handleClearChat}
                            disabled={clearing || messages.length === 0}
                            className="rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-40"
                        >
                            {clearing ? "Clearing…" : "Clear Chat"}
                        </button>
                    </div>
                </div>
            </section>

            {/* Crisis Banner */}
            {showHelp && (
                <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
                    <div className="flex items-start gap-3 mb-4">
                        <span className="text-2xl">🆘</span>
                        <div>
                            <h2 className="text-base font-bold text-amber-900 sm:text-lg">
                                Need urgent support?
                            </h2>
                            <p className="mt-1 text-sm leading-relaxed text-amber-800">
                                If you feel unsafe or overwhelmed, please reach out to someone near you right away.
                            </p>
                        </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                        {[
                            { label: "Tele-MANAS", value: "14416" },
                            { label: "Toll-Free", value: "1800-89-14416" },
                            { label: "Availability", value: "24 / 7" },
                        ].map((item) => (
                            <div key={item.label} className="rounded-2xl border border-amber-200 bg-white p-4">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-600">{item.label}</p>
                                <p className="mt-1.5 text-xl font-bold text-amber-900">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Chat area */}
            <section className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                {/* Messages */}
                <div className="h-[420px] overflow-y-auto bg-gradient-to-b from-gray-50/60 to-white p-4 space-y-4 sm:h-[500px] sm:p-5">
                    {messages.length === 0 ? (
                        <div className="flex h-full items-center justify-center">
                            <div className="text-center max-w-xs">
                                <div className="mb-4 flex justify-center">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-100 to-teal-100 text-3xl shadow-inner">
                                        💬
                                    </div>
                                </div>
                                <h3 className="text-base font-bold text-gray-800">Start a gentle conversation</h3>
                                <p className="mt-1.5 text-sm text-gray-500">Share what's on your mind. This is a private, supportive space.</p>
                            </div>
                        </div>
                    ) : (
                        messages.map((msg, index) => (
                            <div
                                key={msg.id || index}
                                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div className="max-w-[85%] sm:max-w-[75%]">
                                    <p className={`mb-1 px-1 text-[11px] font-semibold ${msg.sender === "user"
                                            ? "text-right text-indigo-400"
                                            : isCrisisReply(msg.text)
                                                ? "text-red-500"
                                                : "text-emerald-500"
                                        }`}>
                                        {msg.sender === "user" ? "You" : isCrisisReply(msg.text) ? "⚠ Urgent Support" : "🤖 AI Support"}
                                    </p>
                                    <div className={`rounded-3xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${msg.sender === "user"
                                            ? "rounded-br-md bg-gradient-to-br from-indigo-500 to-violet-600 text-white"
                                            : isCrisisReply(msg.text)
                                                ? "rounded-bl-md border border-red-200 bg-red-50 text-red-900"
                                                : "rounded-bl-md border border-gray-100 bg-white text-gray-800"
                                        }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    {/* Typing indicator */}
                    {loading && (
                        <div className="flex justify-start">
                            <div>
                                <p className="mb-1 px-1 text-[11px] font-semibold text-emerald-500">🤖 AI Support</p>
                                <div className="flex items-center gap-1.5 rounded-3xl rounded-bl-md border border-gray-100 bg-white px-4 py-3.5 shadow-sm">
                                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "0ms" }} />
                                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "150ms" }} />
                                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "300ms" }} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input bar */}
                <div className="border-t border-gray-100 bg-white p-3 sm:p-4">
                    <div className="flex items-end gap-2">
                        <textarea
                            ref={inputRef}
                            rows="1"
                            placeholder="Type what's on your mind…"
                            value={message}
                            onChange={(e) => {
                                setMessage(e.target.value);
                                e.target.style.height = "auto";
                                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            className="flex-1 resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 leading-relaxed outline-none placeholder:text-gray-400 transition focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                            style={{ minHeight: "44px", maxHeight: "120px" }}
                            disabled={loading}
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading || !message.trim()}
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white transition-all duration-200 ${!loading && message.trim()
                                    ? "bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-200 hover:shadow-lg hover:-translate-y-0.5"
                                    : "bg-gray-200 cursor-not-allowed"
                                }`}
                            aria-label="Send message"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13" />
                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                        </button>
                    </div>
                    <p className="mt-2 px-1 text-[11px] text-gray-400">
                        Press Enter to send · Shift+Enter for new line
                    </p>
                </div>
            </section>
        </div>
    );
}

export default Chat;