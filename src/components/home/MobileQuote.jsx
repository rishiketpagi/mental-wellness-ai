export default function MobileQuote({ dailyQuote, navigate }) {
    return (
        <section className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 p-4 sm:hidden">
            <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-400">Daily Quote</p>
            <p className="mt-1.5 text-sm font-semibold italic leading-relaxed text-indigo-900">"{dailyQuote}"</p>
            <button onClick={() => navigate("/journal")} className="mt-3 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700">
                Reflect in Journal →
            </button>
        </section>
    );
}
