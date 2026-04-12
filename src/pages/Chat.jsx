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

  const messagesEndRef = useRef(null);

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

      const chatData = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
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

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async () => {
    if (!message.trim() || !user) return;

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

      setMessages((prev) => [
        ...prev,
        {
          sender: "user",
          text: currentMessage,
        },
      ]);

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/chat`,
        { message: currentMessage }
      );

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
      console.log("Backend response:", error.response?.data);
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
    <div className="max-w-4xl mx-auto space-y-4 md:space-y-6 px-1 sm:px-0">
      <section className="bg-white rounded-[24px] md:rounded-[28px] shadow-lg border border-gray-100 p-4 sm:p-5 md:p-8">
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold tracking-wide text-emerald-500 uppercase">
              AI Support Space
            </p>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
              Support Chat
            </h1>

            <p className="text-gray-500 mt-3 leading-relaxed">
              Talk freely in a calm, private space. Your AI companion is here
              to respond gently and help you reflect.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <span className="rounded-full bg-emerald-100 text-emerald-700 px-4 py-2 text-sm font-medium">
                {user?.email || "Anonymous user"}
              </span>
              <span className="rounded-full bg-indigo-100 text-indigo-700 px-4 py-2 text-sm font-medium">
                {messages.length} messages
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowHelp((prev) => !prev)}
              className="rounded-2xl bg-amber-100 text-amber-800 px-5 py-3 font-medium hover:bg-amber-200 transition"
            >
              {showHelp ? "Hide Support Info" : "Urgent Help"}
            </button>

            <button
              onClick={handleClearChat}
              className="rounded-2xl bg-red-100 text-red-700 px-5 py-3 font-medium hover:bg-red-200 transition"
            >
              Clear Chat
            </button>
          </div>
        </div>
      </section>

      {showHelp && (
        <section className="bg-white rounded-[28px] shadow-lg border border-amber-100 p-6">
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5">
            <h2 className="text-xl font-semibold text-amber-800">
              Need urgent support?
            </h2>
            <p className="text-sm text-amber-700 mt-2 leading-relaxed">
              If you feel unsafe or overwhelmed, please reach out to someone
              near you right away.
            </p>

            <div className="mt-4 grid sm:grid-cols-3 gap-3">
              <div className="rounded-xl bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                  Tele-MANAS
                </p>
                <p className="text-lg font-bold text-amber-900 mt-1">14416</p>
              </div>

              <div className="rounded-xl bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                  Toll-Free
                </p>
                <p className="text-lg font-bold text-amber-900 mt-1">
                  1800-89-14416
                </p>
              </div>

              <div className="rounded-xl bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                  Availability
                </p>
                <p className="text-lg font-bold text-amber-900 mt-1">24/7</p>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="bg-white rounded-[24px] md:rounded-[28px] shadow-lg border border-gray-100 p-3 sm:p-4 md:p-6">
        <div className="rounded-[20px] md:rounded-[24px] border border-gray-100 bg-gradient-to-b from-gray-50 to-white h-[400px] sm:h-[470px] md:h-[520px] overflow-y-auto p-3 sm:p-4 md:p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="max-w-md text-center">
                <div className="text-5xl mb-4">💬</div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Start a gentle conversation
                </h3>
                <p className="text-gray-500 mt-2 leading-relaxed">
                  Share what’s on your mind.
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={msg.id || index}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
              >
                <div className="max-w-[90%] sm:max-w-[85%] md:max-w-[75%]">
                  <p
                    className={`text-xs mb-1 px-1 ${msg.sender === "user"
                      ? "text-right text-indigo-500"
                      : isCrisisReply(msg.text)
                        ? "text-red-500"
                        : "text-gray-400"
                      }`}
                  >
                    {msg.sender === "user"
                      ? "You"
                      : isCrisisReply(msg.text)
                        ? "Urgent Support"
                        : "AI Support"}
                  </p>

                  <div
                    className={`rounded-3xl px-4 py-3 text-sm md:text-[15px] leading-relaxed shadow-sm whitespace-pre-wrap ${msg.sender === "user"
                      ? "bg-indigo-600 text-white rounded-br-md"
                      : isCrisisReply(msg.text)
                        ? "bg-red-50 border border-red-200 text-red-900 rounded-bl-md"
                        : "bg-white border border-gray-200 text-gray-800 rounded-bl-md"
                      }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[75%] rounded-3xl rounded-bl-md bg-white border border-gray-200 text-gray-500 px-4 py-3 text-sm shadow-sm">
                Typing...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="mt-4 md:mt-5 rounded-[20px] md:rounded-[24px] border border-gray-100 bg-gray-50 p-3 md:p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Type what’s on your mind..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 rounded-2xl border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-300"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSend();
                }
              }}
            />

            <button
              onClick={handleSend}
              disabled={loading}
              className="rounded-2xl bg-indigo-600 text-white px-6 py-3 font-medium hover:bg-indigo-700 transition disabled:opacity-60"
            >
              Send
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-3 px-1">
            This space offers supportive conversation and reflection.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Chat;