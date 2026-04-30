import { getMoodStyle } from "../../utils/homeUtils";
import { formatDate } from "../../utils/dateUtils";

export default function RecentMoods({
    moods,
    navigate,
    editingMoodId,
    editMoodValue,
    setEditMoodValue,
    editMoodNote,
    setEditMoodNote,
    onStartEdit,
    onCancelEdit,
    onSaveEdit,
    onDelete,
}) {
    return (
        <section className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-indigo-700 sm:text-base">Recent Moods</h2>
                <div className="flex gap-1.5">
                    <button onClick={() => navigate("/mood")} className="rounded-xl bg-indigo-100 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-200">+ Add</button>
                    <button onClick={() => navigate("/mood")} className="rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100">View all →</button>
                </div>
            </div>

            {moods.length === 0 ? (
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 text-center">
                    <p className="text-2xl">😊</p>
                    <p className="mt-1 text-sm font-semibold text-gray-700">No moods tracked yet</p>
                    <p className="text-xs text-gray-500">Start with a quick check-in.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {moods.slice(0, 3).map((m) => {
                        const s = getMoodStyle(m.mood);
                        const isEditing = editingMoodId === m.id;
                        return (
                            <div key={m.id} className={`rounded-2xl border p-3 ${s.border} ${s.bg} sm:p-4`}>
                                {isEditing ? (
                                    <div className="space-y-2">
                                        <select value={editMoodValue} onChange={(e) => setEditMoodValue(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300">
                                            {["Happy", "Neutral", "Sad", "Stressed"].map((v) => <option key={v}>{v}</option>)}
                                        </select>
                                        <textarea value={editMoodNote} onChange={(e) => setEditMoodNote(e.target.value)} rows="2" placeholder="Update note..." className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300" />
                                        <div className="flex gap-2">
                                            <button onClick={() => onSaveEdit(m.id)} className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700">Save</button>
                                            <button onClick={onCancelEdit} className="rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${s.badge}`}>{s.emoji} {m.mood}</span>
                                                <span className="text-xs text-gray-400">{formatDate(m.createdAt)}</span>
                                            </div>
                                            {m.note && <p className="mt-1.5 line-clamp-1 text-xs text-gray-600 sm:line-clamp-2">{m.note}</p>}
                                        </div>
                                        <div className="flex shrink-0 gap-1.5">
                                            <button onClick={() => onStartEdit(m)} className="rounded-xl border border-white/80 bg-white/80 px-2.5 py-1 text-xs font-bold text-indigo-700 hover:bg-white">Edit</button>
                                            <button onClick={() => onDelete(m.id)} className="rounded-xl bg-red-100 px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-200">Del</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
