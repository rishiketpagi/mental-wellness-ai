import { formatDate } from "../../utils/dateUtils";

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

export default function RecentJournals({ recentJournals, loading }) {
    const getEmotionColor = (emotion) => {
        const lower = emotion?.toLowerCase() || "neutral";
        return EMOTION_COLORS[lower] || EMOTION_COLORS.neutral;
    };

    const getEmotionEmoji = (emotion) => {
        const lower = emotion?.toLowerCase() || "neutral";
        return EMOTION_EMOJIS[lower] || "😐";
    };

    return (
        <section className="flex flex-col gap-3 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
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
                <div className="space-y-2">
                    {recentJournals.map((journal) => {
                        const colorScheme = getEmotionColor(journal.emotion);
                        const emoji = getEmotionEmoji(journal.emotion);
                        const date = journal.createdAt?.toDate ? journal.createdAt.toDate() : new Date(journal.createdAt);
                        const textPreview = journal.text.substring(0, 80).trim() + (journal.text.length > 80 ? "…" : "");

                        return (
                            <div
                                key={journal.id}
                                className={`rounded-2xl border p-3 sm:p-4 ${colorScheme.border} ${colorScheme.bg}`}
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
                                    <time className="text-xs text-gray-500 shrink-0">
                                        {formatDate(date)}
                                    </time>
                                </div>
                                <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed">
                                    {textPreview}
                                </p>
                                {journal.reflection && (
                                    <p className="text-xs text-gray-600 mt-2 pt-2 border-t border-white/50 italic line-clamp-1">
                                        💡 {journal.reflection.substring(0, 60)}…
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
