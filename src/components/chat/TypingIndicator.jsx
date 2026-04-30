export default function TypingIndicator() {
    return (
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
    );
}
