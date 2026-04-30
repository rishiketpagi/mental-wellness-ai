import { formatDate } from "../../utils/dateUtils";
import { getMoodStyle } from "../../utils/homeUtils";

export default function RecentMoods({ recentMoods, loading }) {
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
                        const date = mood.createdAt?.toDate ? mood.createdAt.toDate() : new Date(mood.createdAt);

                        return (
                            <div
                                key={mood.id}
                                className={`rounded-2xl border p-3 sm:p-4 ${s.border} ${s.bg}`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className="text-xl">{emoji}</span>
                                            <span className={`text-xs font-bold rounded-full px-2 py-0.5 ${s.badge}`}>
                                                {mood.mood}
                                            </span>
                                        </div>
                                        {mood.note && (
                                            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                                                {mood.note}
                                            </p>
                                        )}
                                    </div>
                                    <time className="text-xs text-gray-400 shrink-0">
                                        {formatDate(date)}
                                    </time>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
