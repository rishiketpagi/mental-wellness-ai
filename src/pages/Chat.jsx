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

      const response = await axios.post("http://localhost:5000/chat", {
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-violet-50 to-white px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-indigo-700">Support Chat</h1>
            <p className="text-gray-500 mt-1">
              Talk freely. This space is here to support you gently.
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setShowHelp((prev) => !prev)}
              className="rounded-xl bg-amber-100 px-4 py-2 text-amber-800 hover:bg-amber-200 transition"
            >
              {showHelp ? "Hide Help" : "Urgent Help"}
            </button>

            <button
              onClick={handleClearChat}
              className="rounded-xl bg-red-100 px-4 py-2 text-red-700 hover:bg-red-200 transition"
            >
              Clear Chat
            </button>

            <button
              onClick={() => navigate("/home")}
              className="rounded-xl bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200 transition"
            >
              Back
            </button>
          </div>
        </div>

        {showHelp && (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <h2 className="text-lg font-semibold text-amber-800">
              Need urgent support?
            </h2>
            <p className="text-sm text-amber-700 mt-2">
              Reach out to someone near you right away — a friend, family member,
              teacher, counselor, or another trusted person.
            </p>
            <div className="mt-3 text-sm text-amber-900 space-y-1">
              <p><strong>Tele-MANAS:</strong> 14416</p>
              <p><strong>Toll-free:</strong> 1800-89-14416</p>
              <p><strong>Available:</strong> 24/7 mental health support</p>
            </div>
          </div>
        )}

        <div className="h-[420px] overflow-y-auto rounded-2xl bg-gray-50 p-4 space-y-4 border border-gray-100">
          {messages.length === 0 ? (
            <p className="text-gray-400 text-center mt-20">
              Start by sharing how you feel today.
            </p>
          ) : (
            messages.map((msg, index) => (
              <div
                key={msg.id || index}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm whitespace-pre-wrap ${msg.sender === "user"
                    ? "bg-indigo-600 text-white"
                    : msg.text.includes("Tele-MANAS") || msg.text.includes("14416")
                      ? "bg-red-50 border border-red-200 text-red-900"
                      : "bg-white border border-gray-200 text-gray-800"
                    }`}
                >
                  {msg.text}
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 text-gray-500 rounded-2xl px-4 py-3 text-sm">
                Typing...
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <input
            type="text"
            placeholder="Type what’s on your mind..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-300"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSend();
              }
            }}
          />

          <button
            onClick={handleSend}
            disabled={loading}
            className="rounded-2xl bg-indigo-600 text-white px-6 py-3 hover:bg-indigo-700 transition disabled:opacity-60"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;