import { isCrisisReply } from "../../services/chatService";

export default function MessageBubble({ msg, index }) {
    const isUser = msg.sender === "user";
    const isCrisis = !isUser && isCrisisReply(msg.text);

    return (
        <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[85%] sm:max-w-[75%]">
                <p className={`mb-1 px-1 text-[11px] font-semibold ${isUser
                    ? "text-right text-indigo-400"
                    : isCrisis
                        ? "text-red-500"
                        : "text-emerald-500"
                    }`}>
                    {isUser ? "You" : isCrisis ? "⚠ Urgent Support" : "🤖 AI Support"}
                </p>
                <div className={`rounded-3xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${isUser
                    ? "rounded-br-md bg-gradient-to-br from-indigo-500 to-violet-600 text-white"
                    : isCrisis
                        ? "rounded-bl-md border border-red-200 bg-red-50 text-red-900"
                        : "rounded-bl-md border border-gray-100 bg-white text-gray-800"
                    }`}>
                    {msg.text}
                </div>
            </div>
        </div>
    );
}
