export default function CrisisBanner() {
    return (
        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
            <div className="flex items-start gap-3 mb-4">
                <span className="text-2xl">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                        <path d="M12 8v4" />
                        <path d="M12 16h.01" />
                    </svg>
                </span>
                <div>
                    <h2 className="text-base font-bold text-amber-900 sm:text-lg">
                        Need urgent support?
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-amber-800">
                        If you feel unsafe or overwhelmed, please reach out to someone near you right away.
                    </p>
                </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
                {[
                    { label: "Tele-MANAS", value: "14416" },
                    { label: "Toll-Free", value: "1800-89-14416" },
                    { label: "Availability", value: "24 / 7" },
                ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-amber-200 bg-white p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-600">{item.label}</p>
                        <p className="mt-1.5 text-xl font-bold text-amber-900">{item.value}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
