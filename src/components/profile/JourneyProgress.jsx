export default function JourneyProgress({
    streak,
    streakPct,
    moodCount,
    journalCount,
    onCheckIn,
}) {
    return (
        <section className="profile-fade profile-fade-4 rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 p-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-indigo-500">
                        Your Journey
                    </p>

                    <h3 className="mt-1 text-base font-extrabold text-indigo-900 sm:text-lg">
                        {streak > 0
                            ? `🔥 ${streak}-day streak — keep it going!`
                            : "Start your first streak today!"}
                    </h3>

                    <p className="mt-0.5 text-sm text-indigo-700">
                        {moodCount} mood logs · {journalCount} reflections ·{" "}
                        {streak > 0 ? `${streak} consecutive days` : "no active streak yet"}
                    </p>
                </div>

                <button
                    onClick={onCheckIn}
                    className="self-start shrink-0 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg sm:self-auto"
                >
                    Check in now →
                </button>
            </div>

            <div className="mt-4">
                <div className="mb-1.5 flex justify-between text-xs font-semibold text-indigo-500">
                    <span>Streak progress</span>
                    <span>{streak} / 30 days</span>
                </div>

                <div className="h-2.5 w-full overflow-hidden rounded-full bg-indigo-100">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700"
                        style={{ width: `${Math.min(streakPct * 100, 100)}%` }}
                    />
                </div>
            </div>
        </section>
    );
}