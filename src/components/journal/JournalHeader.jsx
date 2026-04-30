export default function JournalHeader({ prompt }) {
    return (
        <header className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-xl shadow-md">
                    📝
                </div>
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-500 sm:text-xs">
                        Guided Journal
                    </p>
                    <h1 className="mt-0.5 text-xl font-bold text-gray-900 sm:text-2xl">
                        Journal Reflection
                    </h1>
                </div>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-gray-500 sm:text-base">
                Write freely. Your AI companion will respond with a gentle, private reflection.
            </p>

            <div className="mt-4 rounded-2xl border border-violet-100 bg-violet-50 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-500">
                    Today's Prompt
                </p>
                <p className="mt-1.5 text-sm font-semibold leading-relaxed text-violet-900 sm:text-base">
                    {prompt}
                </p>
            </div>
        </header>
    );
}
