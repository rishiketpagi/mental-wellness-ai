export default function ChatHeader({ showHelp, onToggleHelp, onClearChat, clearing, messageCount }) {
    return (
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
                        onClick={onToggleHelp}
                        className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${showHelp
                            ? "bg-amber-600 text-white"
                            : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                            }`}
                    >
                        🆘 {showHelp ? "Hide Help" : "Urgent Help"}
                    </button>
                    <button
                        onClick={onClearChat}
                        disabled={clearing || messageCount === 0}
                        className="rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-40"
                    >
                        {clearing ? "Clearing…" : "Clear Chat"}
                    </button>
                </div>
            </div>
        </section>
    );
}
