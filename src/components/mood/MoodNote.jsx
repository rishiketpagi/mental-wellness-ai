export default function MoodNote({ note, onChange }) {
    return (
        <div className="mt-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
                Add a note <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
                placeholder="What's on your mind? e.g. I felt tired after a long day..."
                value={note}
                onChange={(e) => onChange(e.target.value)}
                rows="3"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 sm:text-base"
            />
        </div>
    );
}
