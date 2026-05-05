export default function JournalEditor({
    journalText,
    onChange,
    loading,
    onSave,
    onBack,
    isEditing,
    onCancelEdit,
}) {
    const charCount = journalText.length;

    return (
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700">
                    {isEditing ? "Editing reflection" : "Your reflection"}
                </label>
                <span className={`text-xs font-medium ${charCount > 0 ? "text-violet-500" : "text-gray-300"}`}>
                    {charCount} characters
                </span>
            </div>

            <textarea
                value={journalText}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Start writing here…"
                rows="9"
                className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm leading-relaxed text-gray-800 outline-none placeholder:text-gray-400 transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100 sm:text-base"
                disabled={loading}
            />

            {loading && (
                <div className="mt-3 flex items-center gap-3 rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3">
                    <div className="flex gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400" style={{ animationDelay: "0ms" }} />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400" style={{ animationDelay: "150ms" }} />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400" style={{ animationDelay: "300ms" }} />
                    </div>
                    <p className="text-sm font-medium text-violet-700">
                        Analyzing your reflection…
                    </p>
                </div>
            )}

            <div className="mt-5 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-between sm:items-center">
                <button
                    onClick={onBack}
                    className="rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-200"
                    disabled={loading}
                >
                    ← Back
                </button>

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:gap-2.5">
                    {isEditing && (
                        <button
                            onClick={onCancelEdit}
                            className="rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-200"
                            disabled={loading}
                        >
                            Cancel edit
                        </button>
                    )}

                    <button
                        onClick={onSave}
                        disabled={loading || !journalText.trim()}
                        className={`rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-all duration-200 ${!loading && journalText.trim()
                            ? "bg-gradient-to-r from-violet-500 to-indigo-600 shadow-md shadow-violet-200 hover:shadow-lg hover:shadow-violet-200 hover:-translate-y-0.5"
                            : "bg-gray-300 cursor-not-allowed"
                            }`}
                    >
                        {loading ? "Analyzing..." : isEditing ? "Save changes" : "Save & Reflect"}
                    </button>
                </div>
            </div>
        </div>
    );
}
