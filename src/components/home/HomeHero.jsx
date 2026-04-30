export default function HomeHero({ user, initial, latestMood, moodStyle, streak, moods, journals, dailyQuote, onChat, onLogout }) {
    return (
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-5 text-white shadow-lg sm:p-7">
            {/* blobs */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-8 left-4 h-32 w-32 rounded-full bg-purple-400/20 blur-2xl" />

            <div className="relative">
                {/* top row: avatar + buttons */}
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-base font-bold backdrop-blur-sm ring-2 ring-white/30 sm:h-12 sm:w-12 sm:text-xl">
                            {initial}
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-white/60">Welcome back</p>
                            <h1 className="text-lg font-extrabold leading-tight sm:text-2xl">
                                {user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || "There"} 👋
                            </h1>
                        </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                        <button onClick={onChat} className="rounded-xl bg-white/20 px-3 py-2 text-xs font-bold backdrop-blur-sm transition hover:bg-white/30 sm:px-4 sm:text-sm">
                            💬 Chat
                        </button>
                        <button onClick={onLogout} className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-white/80 backdrop-blur-sm transition hover:bg-white/20 sm:px-4 sm:text-sm">
                            Logout
                        </button>
                    </div>
                </div>

                {/* quote — hidden on smallest screens, shown sm+ */}
                <p className="mt-4 hidden text-sm font-medium italic text-white/75 sm:block">
                    "{dailyQuote}"
                </p>

                {/* stat pills */}
                <div className="mt-4 flex flex-wrap gap-2">
                    {latestMood ? (
                        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                            {moodStyle.emoji} Feeling {latestMood.mood}
                        </span>
                    ) : (
                        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                            No mood yet
                        </span>
                    )}
                    {streak > 0 && (
                        <span className="rounded-full bg-amber-400/30 px-3 py-1 text-xs font-semibold text-amber-100">
                            🔥 {streak}d streak
                        </span>
                    )}
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                        {moods.length} moods · {journals.length} journals
                    </span>
                </div>
            </div>
        </section>
    );
}
