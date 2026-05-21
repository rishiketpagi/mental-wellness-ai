import { formatDate, formatDateFull } from "../../utils/dateUtils";

const EMOTION_COLORS = {
    happy: { bg: "bg-emerald-50", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-700" },
    sad: { bg: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-100 text-blue-700" },
    anxious: { bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-100 text-amber-700" },
    calm: { bg: "bg-teal-50", border: "border-teal-200", badge: "bg-teal-100 text-teal-700" },
    neutral: { bg: "bg-gray-50", border: "border-gray-200", badge: "bg-gray-100 text-gray-700" },
};

const EMOTION_EMOJIS = {
    happy: "😊",
    sad: "😢",
    anxious: "😰",
    calm: "😌",
    neutral: "😐",
};

export default function RecentJournals({ recentJournals, loading, selectedJournal, onSelect, onClearSelection, onEdit, onDelete }) {
    const getEmotionColor = (emotion) => {
        const lower = emotion?.toLowerCase() || "neutral";
        return EMOTION_COLORS[lower] || EMOTION_COLORS.neutral;
    };

    const getEmotionEmoji = (emotion) => {
        const lower = emotion?.toLowerCase() || "neutral";
        return EMOTION_EMOJIS[lower] || "😐";
    };

    const getJournalDate = (journal) => {
        if (!journal?.createdAt) return null;
        return journal.createdAt?.toDate ? journal.createdAt.toDate() : new Date(journal.createdAt);
    };

    const getSafeText = (value) => (value || "").trim();

    return (
        <section
            className="flex flex-col gap-3 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6"
            onClick={() => onClearSelection?.()}
        >
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-violet-700 sm:text-base">
                    Recent Journals
                </h2>
                <span className="text-xs font-semibold text-gray-400">
                    Last {recentJournals.length}
                </span>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-violet-200 border-t-violet-500" />
                </div>
            ) : recentJournals.length === 0 ? (
                <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4 text-center">
                    <p className="text-2xl">📝</p>
                    <p className="mt-1 text-xs font-semibold text-gray-700">
                        No journals yet
                    </p>
                    <p className="text-xs text-gray-500">
                        Write your first reflection!
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {selectedJournal && (
                        <article
                            className="rounded-3xl border border-violet-100 bg-gradient-to-b from-violet-50 via-white to-white p-4 shadow-sm"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-violet-500">
                                        Selected journal
                                    </p>
                                    <h3 className="mt-1 text-sm font-extrabold text-gray-900">
                                        {getSafeText(selectedJournal.emotion) || "Neutral"}
                                    </h3>
                                </div>
                                <div className="flex shrink-0 flex-col items-end gap-1">
                                    <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-[11px] font-bold text-violet-700">
                                        {getJournalDate(selectedJournal) ? formatDateFull(getJournalDate(selectedJournal)) : "Recent entry"}
                                    </span>
                                    {selectedJournal.stressLevel && (
                                        <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-[11px] font-semibold text-gray-600">
                                            Stress: {selectedJournal.stressLevel}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 space-y-4">
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">
                                        Journal entry
                                    </p>
                                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-gray-800">
                                        {getSafeText(selectedJournal.text) || "No journal text was saved for this entry."}
                                    </p>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-2xl bg-emerald-50 p-3">
                                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-600">
                                            Reflection
                                        </p>
                                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                                            {getSafeText(selectedJournal.reflection) || "No reflection was generated for this entry."}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl bg-amber-50 p-3">
                                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-600">
                                            Gentle suggestion
                                        </p>
                                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                                            {getSafeText(selectedJournal.suggestion) || "No suggestion was generated for this entry."}
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </article>
                    )}

                    {recentJournals.map((journal) => {
                        const colorScheme = getEmotionColor(journal.emotion);
                        const emoji = getEmotionEmoji(journal.emotion);
                        const date = getJournalDate(journal);
                        const journalText = getSafeText(journal.text);
                        const textPreview = journalText.substring(0, 80) + (journalText.length > 80 ? "…" : "");

                        return (
                            <div
                                key={journal.id}
                                role="button"
                                tabIndex={0}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onSelect?.(journal);
                                }}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" || event.key === " ") {
                                        event.preventDefault();
                                        onSelect?.(journal);
                                    }
                                }}
                                className={`cursor-pointer rounded-2xl border p-3 transition sm:p-4 ${colorScheme.border} ${colorScheme.bg} ${selectedJournal?.id === journal.id ? "ring-2 ring-violet-300" : "hover:shadow-sm"}`}
                            >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className={`text-xs font-bold rounded-full px-2.5 py-0.5 ${colorScheme.badge}`}>
                                            {emoji} {journal.emotion || "Neutral"}
                                        </span>
                                        {journal.stressLevel && (
                                            <span className="text-xs font-semibold text-gray-600 bg-white/60 rounded-full px-2 py-0.5">
                                                Stress: {journal.stressLevel}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                                        <time className="text-xs text-gray-500">
                                            {date ? formatDate(date) : "Recently"}
                                        </time>
                                        <div className="flex gap-1.5">
                                            <button
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    onEdit?.(journal);
                                                }}
                                                className="rounded-lg border border-white/80 bg-white/80 px-2.5 py-1 text-[11px] font-bold text-violet-700 transition hover:bg-white"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    onDelete?.(journal.id);
                                                }}
                                                className="rounded-lg bg-red-100 px-2.5 py-1 text-[11px] font-bold text-red-600 transition hover:bg-red-200"
                                            >
                                                Del
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed">
                                    {textPreview}
                                </p>
                                {journal.reflection && (
                                    <p className="text-xs text-gray-600 mt-2 pt-2 border-t border-white/50 italic line-clamp-1">
                                        💡 {journal.reflection.substring(0, 60)}{journal.reflection.length > 60 ? "…" : ""}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
