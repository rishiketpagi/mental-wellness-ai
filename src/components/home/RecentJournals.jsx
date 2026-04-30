import { formatDate } from "../../utils/dateUtils";

export default function RecentJournals({
    journals,
    navigate,
    editingJournalId,
    editJournalText,
    setEditJournalText,
    onStartEdit,
    onCancelEdit,
    onSaveEdit,
    onDelete,
}) {
    return (
        <section className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-violet-700 sm:text-base">Recent Journals</h2>
                <div className="flex gap-1.5">
                    <button onClick={() => navigate("/journal")} className="rounded-xl bg-violet-100 px-3 py-1.5 text-xs font-bold text-violet-700 hover:bg-violet-200">+ Add</button>
                    <button onClick={() => navigate("/journal")} className="rounded-xl bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700 hover:bg-violet-100">View all →</button>
                </div>
            </div>

            {journals.length === 0 ? (
                <div className="rounded-2xl border border-violet-100 bg-violet-50 p-5 text-center">
                    <p className="text-2xl">📝</p>
                    <p className="mt-1 text-sm font-semibold text-gray-700">No journals yet</p>
                    <p className="text-xs text-gray-500">Write your first reflection.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {journals.slice(0, 2).map((j) => {
                        const isEditing = editingJournalId === j.id;
                        return (
                            <div key={j.id} className="rounded-2xl border border-violet-100 bg-gradient-to-b from-violet-50 to-white p-3 sm:p-4">
                                {isEditing ? (
                                    <div className="space-y-2">
                                        <textarea value={editJournalText} onChange={(e) => setEditJournalText(e.target.value)} rows="4" className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-300" placeholder="Edit your journal..." />
                                        <div className="flex gap-2">
                                            <button onClick={() => onSaveEdit(j.id)} className="rounded-xl bg-violet-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-violet-700">Save</button>
                                            <button onClick={onCancelEdit} className="rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                {j.emotion && <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-bold text-violet-700">{j.emotion}</span>}
                                                <span className="text-xs text-gray-400">{formatDate(j.createdAt)}</span>
                                            </div>
                                            <p className="line-clamp-2 text-sm leading-relaxed text-gray-800">{j.text}</p>
                                            {j.reflection && <p className="mt-1 line-clamp-1 text-xs italic text-gray-500">"{j.reflection}"</p>}
                                        </div>
                                        <div className="flex shrink-0 flex-col gap-1.5">
                                            <button onClick={() => onStartEdit(j)} className="rounded-xl border border-violet-200 bg-white/80 px-2.5 py-1 text-xs font-bold text-violet-700 hover:bg-white">Edit</button>
                                            <button onClick={() => onDelete(j.id)} className="rounded-xl bg-red-100 px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-200">Del</button>
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
