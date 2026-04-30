import InfoRow from "./InfoRow";

export default function AccountDetails({
    user,
    editing,
    setEditing,
    tempName,
    setTempName,
    displayName,
    savingName,
    sendingVerification,
    onSaveName,
    onCancelEdit,
    onResendVerification,
}) {
    return (
        <div className="profile-fade profile-fade-2 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-3 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h2 className="text-base font-extrabold text-gray-900 sm:text-lg">
                        Account Details
                    </h2>
                    <p className="text-xs text-gray-400">Your personal information</p>
                </div>

                {!editing && (
                    <button
                        onClick={() => setEditing(true)}
                        className="flex items-center gap-1.5 rounded-xl bg-indigo-100 px-3 py-2 text-xs font-bold text-indigo-700 transition hover:bg-indigo-200"
                    >
                        ✏️ Edit name
                    </button>
                )}
            </div>

            <div className="space-y-2.5">
                <InfoRow icon="✉️" label="Email" value={user?.email || "Anonymous user"} />

                <InfoRow
                    icon="🛡️"
                    label="Account Type"
                    value={user?.isAnonymous ? "Anonymous Guest" : "Registered Account"}
                />

                <InfoRow
                    icon={user?.emailVerified ? "✅" : "⚠️"}
                    label="Email Verification"
                    value={user?.emailVerified ? "Verified" : "Not verified yet"}
                    aside={
                        !user?.isAnonymous && !user?.emailVerified ? (
                            <button
                                onClick={onResendVerification}
                                disabled={sendingVerification}
                                className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
                            >
                                {sendingVerification ? "Sending…" : "Resend"}
                            </button>
                        ) : null
                    }
                />

                <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3.5 transition hover:bg-white hover:shadow-sm">
                    <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-base shadow-sm">
                            👤
                        </span>

                        <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                                Display Name
                            </p>

                            {editing ? (
                                <div className="mt-2 space-y-2">
                                    <input
                                        type="text"
                                        value={tempName}
                                        onChange={(e) => setTempName(e.target.value)}
                                        placeholder="How should we call you?"
                                        autoFocus
                                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                                    />

                                    <div className="flex gap-2">
                                        <button
                                            onClick={onSaveName}
                                            disabled={savingName}
                                            className="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                                        >
                                            {savingName ? "Saving…" : "Save"}
                                        </button>

                                        <button
                                            onClick={onCancelEdit}
                                            className="rounded-xl bg-gray-200 px-4 py-1.5 text-xs font-bold text-gray-600 transition hover:bg-gray-300"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="mt-0.5 truncate text-sm font-semibold text-gray-800">
                                    {displayName || (
                                        <span className="italic text-gray-400">Not set</span>
                                    )}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}