import { useEffect, useState } from "react";
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

  const fetchMessages = async () => {
    try {
      if (!user) return;

      const q = query(
        collection(db, "chats"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "asc")
      );

      const snapshot = await getDocs(q);

      const chatData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setMessages(chatData);
    } catch (error) {
      console.error("Fetch chat error:", error.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user]);

  const handleSend = async () => {
    if (!message.trim() || !user) return;

    const currentMessage = message;
    setMessage("");
    setLoading(true);

    try {
      await addDoc(collection(db, "chats"), {
        userId: user.uid,
        sender: "user",
        text: currentMessage,
        createdAt: serverTimestamp(),
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: "user",
          text: currentMessage,
        },
      ]);

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

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: aiReply,
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      alert(
        error.response?.data?.details ||
        error.response?.data?.error ||
        "Failed to get response"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = async () => {
    try {
      if (!user) return;

      const q = query(
        collection(db, "chats"),
        where("userId", "==", user.uid)
      );

      const snapshot = await getDocs(q);

      const deletePromises = snapshot.docs.map((chatDoc) =>
        deleteDoc(doc(db, "chats", chatDoc.id))
      );

      await Promise.all(deletePromises);

      setMessages([]);
    } catch (error) {
      console.error("Clear chat error:", error.message);
      alert("Failed to clear chat");
    }
  };

  return (
    <section className="mx-auto w-full max-w-5xl space-y-3 sm:space-y-4">
      <header className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6 md:p-7">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-500 sm:text-xs">Support Space</p>
            <h1 className="mt-1.5 text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">Support Chat</h1>
            <p className="mt-1.5 text-xs text-gray-500 sm:text-sm md:text-base">
              Talk freely. This space is here to support you gently.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:w-auto">
            <button
              onClick={() => setShowHelp((prev) => !prev)}
              className="rounded-xl bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-800 transition hover:bg-amber-200 sm:text-sm"
            >
              {showHelp ? "Hide urgent help" : "Urgent help"}
            </button>

            <button
              onClick={handleClearChat}
              className="rounded-xl bg-red-100 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-200 sm:text-sm"
            >
              Clear chat
            </button>

            <button
              onClick={() => navigate("/home")}
              className="rounded-xl bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-200 sm:text-sm"
            >
              Dashboard
            </button>
          </div>
        </div>
      </header>

      {showHelp && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <h2 className="text-lg font-semibold text-amber-800">
            Need urgent support?
          </h2>
          <p className="mt-2 text-sm text-amber-700">
            Reach out to someone near you right away: a friend, family member,
            teacher, counselor, or another trusted person.
          </p>
          <div className="mt-3 space-y-1 text-sm text-amber-900">
            <p><strong>Tele-MANAS:</strong> 14416</p>
            <p><strong>Toll-free:</strong> 1800-89-14416</p>
            <p><strong>Available:</strong> 24/7 mental health support</p>
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-gray-100 bg-white p-3 shadow-sm sm:p-5">
        <div className="h-[52vh] min-h-[300px] max-h-[520px] space-y-3 overflow-y-auto rounded-2xl border border-gray-100 bg-gray-50 p-3 sm:p-4">
          {messages.length === 0 ? (
            <p className="mt-20 text-center text-gray-400">
              Start by sharing how you feel today.
            </p>
          ) : (
            messages.map((msg, index) => (
              <div
                key={msg.id || index}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl px-3 py-2.5 text-sm leading-relaxed shadow-sm whitespace-pre-wrap sm:max-w-[76%] sm:px-4 sm:py-3 ${msg.sender === "user"
                    ? "bg-indigo-600 text-white"
                    : msg.text.includes("Tele-MANAS") || msg.text.includes("14416")
                      ? "border border-red-200 bg-red-50 text-red-900"
                      : "border border-gray-200 bg-white text-gray-800"
                    }`}
                >
                  {msg.text}
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500">
                Typing...
              </div>
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-col gap-2.5 sm:flex-row">
          <input
            type="text"
            placeholder="Type what is on your mind..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full flex-1 rounded-2xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-indigo-300 sm:py-3"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSend();
              }
            }}
          />

          <button
            onClick={handleSend}
            disabled={loading}
            className="rounded-2xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60 sm:px-6 sm:py-3"
          >
            Send
          </button>
        </div>
      </div>
    </section>
  );
}

export default Chat;