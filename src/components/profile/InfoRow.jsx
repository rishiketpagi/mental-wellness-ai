export default function InfoRow({ icon, label, value, aside }) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3.5 transition hover:bg-white hover:shadow-sm">
            <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-base shadow-sm">
                    {icon}
                </span>

                <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                        {label}
                    </p>
                    <p className="truncate text-sm font-semibold text-gray-800">
                        {value}
                    </p>
                </div>
            </div>

            {aside && <div className="shrink-0">{aside}</div>}
        </div>
    );
}