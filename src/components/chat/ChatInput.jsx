export default function ChatInput({ message, setMessage, loading, onSend, inputRef }) {
    return (
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
                            onSend();
                        }
                    }}
                    className="flex-1 resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 leading-relaxed outline-none placeholder:text-gray-400 transition focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                    style={{ minHeight: "44px", maxHeight: "120px" }}
                    disabled={loading}
                />
                <button
                    onClick={onSend}
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
    );
}
