export default function ActionBtn({ emoji, label, sub, gradient, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`group flex flex-col items-start gap-1.5 rounded-2xl bg-gradient-to-br ${gradient} p-4 text-left text-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md`}
        >
            <span className="text-2xl transition-transform group-hover:scale-110">
                {emoji}
            </span>
            <p className="mt-1 text-sm font-bold">{label}</p>
            <p className="text-[11px] text-white/70">{sub}</p>
        </button>
    );
}