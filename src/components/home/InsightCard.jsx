export default function InsightCard({ insight }) {
    return (
        <section className={`rounded-2xl border bg-gradient-to-br ${insight.from} ${insight.to} ${insight.border} p-4 sm:p-5`}>
            <p className={`text-[11px] font-bold uppercase tracking-widest ${insight.label}`}>AI Insight</p>
            <h2 className={`mt-1.5 text-base font-extrabold sm:text-lg ${insight.body}`}>{insight.title}</h2>
            <p className={`mt-1 text-sm leading-relaxed ${insight.body}`}>{insight.message}</p>
        </section>
    );
}
