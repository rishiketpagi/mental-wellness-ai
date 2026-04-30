import { MOODS } from "../../utils/constants";

export default function MoodSelector({ selected, onSelect }) {
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {MOODS.map((mood) => {
                const isSelected = selected === mood.value;
                return (
                    <button
                        key={mood.value}
                        onClick={() => onSelect(mood.value)}
                        className={`group relative flex flex-col items-center gap-2 rounded-2xl border-2 bg-gradient-to-b p-4 text-center transition-all duration-200 sm:p-5 ${isSelected
                            ? `${mood.border} ${mood.bg} ring-2 ${mood.ring} scale-[1.03] shadow-md`
                            : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
                            }`}
                    >
                        <span className={`text-4xl transition-transform duration-200 ${isSelected ? "scale-110" : "group-hover:scale-105"}`}>
                            {mood.emoji}
                        </span>
                        <div>
                            <p className={`text-sm font-bold ${isSelected ? mood.text : "text-gray-800"}`}>
                                {mood.label}
                            </p>
                            <p className="mt-0.5 text-xs text-gray-400 leading-tight">
                                {mood.desc}
                            </p>
                        </div>
                        {isSelected && (
                            <div className={`absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br ${mood.active} text-white text-[10px] shadow`}>
                                ✓
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
