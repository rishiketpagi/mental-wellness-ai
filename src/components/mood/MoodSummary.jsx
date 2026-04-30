export default function MoodSummary({ weeklySummary, loading }) {
    const MOOD_EMOJIS = {
        Happy: "😊",
        Neutral: "😐",
        Sad: "😢",
        Stressed: "😰",
    };

    if (loading) {
        return (
            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6 flex items-center justify-center py-8">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-500" />
            </div>
        );
    }

    if (!weeklySummary) {
        return null;
    }

    const dominantEmoji = MOOD_EMOJIS[weeklySummary.dominantMood] || "😊";

    return (
        <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-sm font-extrabold text-indigo-700 sm:text-base mb-4">
                This Week
            </h2>

            <div className="grid grid-cols-2 gap-3">
                {/* Total Moods */}
                <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-indigo-100/50 p-4">
                    <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wider mb-2">
                        Total Moods
                    </p>
                    <p className="text-2xl font-extrabold text-indigo-700">
                        {weeklySummary.total}
                    </p>
                </div>

                {/* Dominant Mood */}
                <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-violet-100/50 p-4">
                    <p className="text-xs text-violet-600 font-semibold uppercase tracking-wider mb-2">
                        Dominant
                    </p>
                    <div className="text-2xl">
                        {dominantEmoji} {weeklySummary.dominantMood}
                    </div>
                </div>
            </div>

            {/* Breakdown */}
            {Object.keys(weeklySummary.breakdown).length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2.5">
                        Breakdown
                    </p>
                    <div className="space-y-1.5">
                        {Object.entries(weeklySummary.breakdown)
                            .sort(([, a], [, b]) => b - a)
                            .map(([moodName, count]) => (
                                <div key={moodName} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1.5">
                                        <span>{MOOD_EMOJIS[moodName] || "😊"}</span>
                                        <span className="font-semibold text-gray-700">{moodName}</span>
                                    </div>
                                    <span className="text-gray-500 font-medium">{count}</span>
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </section>
    );
}
