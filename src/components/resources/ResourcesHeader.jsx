export default function ResourcesHeader({ onBack }) {
    return (
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-xl shadow-md">
                        🌿
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-500 sm:text-xs">
                            Support Library
                        </p>
                        <h1 className="mt-0.5 text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">
                            Wellness Resources
                        </h1>
                        <p className="mt-1 max-w-xl text-sm text-gray-500 sm:text-base">
                            Simple, practical support for common emotional struggles.
                        </p>
                    </div>
                </div>
                <button
                    onClick={onBack}
                    className="self-start rounded-xl bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-200"
                >
                    ← Back
                </button>
            </div>
        </div>
    );
}
