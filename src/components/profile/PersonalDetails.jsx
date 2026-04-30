import { useState } from "react";

export default function PersonalDetails({
    age,
    gender,
    bio,
    editing,
    setEditing,
    tempAge,
    setTempAge,
    tempGender,
    setTempGender,
    tempBio,
    setTempBio,
    saving,
    onSave,
    onCancel,
}) {
    const GENDERS = ["Prefer not to say", "Male", "Female", "Other"];
    const BIO_MAX_CHARS = 160;

    return (
        <section className="profile-fade profile-fade-2 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-extrabold text-gray-900">
                    💫 Personal Details
                </h2>
                {!editing && (
                    <button
                        onClick={() => setEditing(true)}
                        className="rounded-xl bg-indigo-100 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-200 transition"
                    >
                        Edit
                    </button>
                )}
            </div>

            {editing ? (
                <div className="space-y-4">
                    {/* Age */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                            Age <span className="font-normal text-gray-400">(optional)</span>
                        </label>
                        <input
                            type="number"
                            min="0"
                            max="120"
                            value={tempAge}
                            onChange={(e) => setTempAge(e.target.value)}
                            placeholder="Your age"
                            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                        />
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                            Gender
                        </label>
                        <select
                            value={tempGender}
                            onChange={(e) => setTempGender(e.target.value)}
                            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                        >
                            {GENDERS.map((g) => (
                                <option key={g} value={g}>
                                    {g}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Bio */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-semibold text-gray-700">
                                Bio <span className="font-normal text-gray-400">(optional)</span>
                            </label>
                            <span className={`text-xs font-medium ${tempBio.length > BIO_MAX_CHARS ? "text-red-500" : "text-gray-400"}`}>
                                {tempBio.length}/{BIO_MAX_CHARS}
                            </span>
                        </div>
                        <textarea
                            value={tempBio}
                            onChange={(e) => setTempBio(e.target.value.substring(0, BIO_MAX_CHARS))}
                            placeholder="Tell us about yourself…"
                            rows="3"
                            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 resize-none"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                        <button
                            onClick={onSave}
                            disabled={saving}
                            className={`flex-1 rounded-xl px-4 py-2.5 text-xs font-bold text-white transition-all duration-200 ${!saving
                                ? "bg-gradient-to-r from-indigo-500 to-violet-600 hover:shadow-md shadow-indigo-200 hover:-translate-y-0.5"
                                : "bg-gray-300 cursor-not-allowed"
                                }`}
                        >
                            {saving ? "Saving…" : "Save Details"}
                        </button>
                        <button
                            onClick={onCancel}
                            disabled={saving}
                            className="flex-1 rounded-xl bg-gray-100 px-4 py-2.5 text-xs font-bold text-gray-600 transition hover:bg-gray-200 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {/* Display View */}
                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3.5">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                            Age
                        </p>
                        <p className="text-sm font-semibold text-gray-800">
                            {age ? `${age} years old` : "Not specified"}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3.5">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                            Gender
                        </p>
                        <p className="text-sm font-semibold text-gray-800">
                            {gender || "Prefer not to say"}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3.5">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                            Bio
                        </p>
                        <p className="text-sm text-gray-700 leading-relaxed">
                            {bio ? bio : <span className="text-gray-400 italic">No bio added yet</span>}
                        </p>
                    </div>
                </div>
            )}
        </section>
    );
}
