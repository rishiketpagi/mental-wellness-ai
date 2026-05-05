import { formatDate } from "../../utils/dateUtils";
import { getMoodStyle } from "../../utils/homeUtils";

export default function RecentMoods({
    recentMoods,
    loading,
    onEdit,
    onDelete,
}) {
    const MOOD_EMOJIS = {
        Happy: "😊",
        Neutral: "😐",
        Sad: "😢",
        Stressed: "😰",
    };

    return (
        <section className="flex flex-col gap-3 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-indigo-700 sm:text-base">
                    Recent Moods
                </h2>
                <span className="text-xs font-semibold text-gray-400">
                    Last {recentMoods.length}
                </span>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-500" />
                </div>
            ) : recentMoods.length === 0 ? (
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-center">
                    <p className="text-2xl">😊</p>
                    <p className="mt-1 text-xs font-semibold text-gray-700">
                        No moods yet
                    </p>
                    <p className="text-xs text-gray-500">
                        Log your first mood above!
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {recentMoods.map((mood) => {
                        const s = getMoodStyle(mood.mood);
                        const emoji = MOOD_EMOJIS[mood.mood] || "😊";
                        const date = mood.createdAt?.toDate
                            ? mood.createdAt.toDate()
                            : new Date(mood.createdAt);

                        return (
                            <div
                                key={mood.id}
                                className={`rounded-2xl border p-3 sm:p-4 ${s.border} ${s.bg}`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                        <div className="mb-1.5 flex items-center gap-2">
                                            <span className="text-xl">{emoji}</span>
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${s.badge}`}>
                                                {mood.mood}
                                            </span>
                                        </div>

                                        {mood.note && (
                                            <p className="line-clamp-2 text-xs leading-relaxed text-gray-600">
                                                {mood.note}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                                        <time className="text-xs text-gray-400">
                                            {formatDate(date)}
                                        </time>

                                        <div className="flex gap-1.5">
                                            <button
                                                onClick={() => onEdit?.(mood)}
                                                className="rounded-lg border border-white/80 bg-white/80 px-2.5 py-1 text-[11px] font-bold text-indigo-700 transition hover:bg-white"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                onClick={() => onDelete?.(mood.id)}
                                                className="rounded-lg bg-red-100 px-2.5 py-1 text-[11px] font-bold text-red-600 transition hover:bg-red-200"
                                            >
                                                Del
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}