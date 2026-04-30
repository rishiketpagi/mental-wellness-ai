import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import {
    fetchChatMessages,
    saveMessage,
    sendChatMessage,
    clearAllMessages,
} from "../services/chatService";

export default function useChat() {
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

    useEffect(() => {
        if (!user) return;
        const load = async () => {
            try {
                const msgs = await fetchChatMessages(user.uid);
                setMessages(msgs);
            } catch (error) {
                console.error("Fetch chat error:", error.message);
            }
        };
        load();
    }, [user]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const handleSend = async () => {
        if (!message.trim() || !user || loading) return;

        const currentMessage = message.trim();
        setMessage("");
        setLoading(true);

        try {
            await saveMessage(user.uid, "user", currentMessage);
            setMessages((prev) => [...prev, { sender: "user", text: currentMessage }]);

            const aiReply = await sendChatMessage(currentMessage);

            await saveMessage(user.uid, "ai", aiReply);
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
            await clearAllMessages(user.uid);
            setMessages([]);
        } catch (error) {
            console.error("Clear chat error:", error.message);
        } finally {
            setClearing(false);
        }
    };

    const toggleHelp = () => setShowHelp((p) => !p);

    return {
        message, setMessage,
        messages, loading,
        showHelp, toggleHelp,
        clearing,
        messagesEndRef, inputRef,
        handleSend, handleClearChat,
    };
}
