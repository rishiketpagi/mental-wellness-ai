export default function ProfileHero({
    user,
    name,
    initial,
    photoURL,
    uploadingPhoto,
    onPhotoUpload,
    onJournal,
    onLogout,
}) {
    return (
        <section className="profile-fade relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-6 text-white shadow-xl sm:p-8">
            <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-purple-400/20 blur-2xl" />

            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-5">
                    <div className="relative">
                        <label className="group relative cursor-pointer">
                            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl bg-white/20 text-3xl font-extrabold text-white shadow-lg backdrop-blur-sm ring-4 ring-white/30 sm:h-24 sm:w-24 sm:text-4xl">
                                {photoURL ? (
                                    <img
                                        src={photoURL}
                                        alt="Profile"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    initial
                                )}
                            </div>

                            <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-black/40 text-xs font-bold text-white opacity-0 transition group-hover:opacity-100">
                                {uploadingPhoto ? "Uploading..." : "Change"}
                            </div>

                            <input
                                type="file"
                                accept="image/*"
                                onChange={onPhotoUpload}
                                className="hidden"
                                disabled={uploadingPhoto}
                            />
                        </label>

                        <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-violet-600 bg-emerald-400 shadow" />
                    </div>

                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
                            Your Profile
                        </p>

                        <h1 className="mt-1 text-2xl font-extrabold leading-tight sm:text-3xl">
                            Hi, {name}
                        </h1>

                        <div className="mt-2 flex flex-wrap gap-2">
                            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                                {user?.email || "Anonymous"}
                            </span>

                            <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${user?.emailVerified
                                        ? "bg-emerald-400/30 text-emerald-100"
                                        : "bg-amber-400/30 text-amber-100"
                                    }`}
                            >
                                {user?.emailVerified ? "✓ Verified" : "⚠ Not verified"}
                            </span>

                            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                                {user?.isAnonymous ? "Anonymous" : "Registered"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
                    <button
                        onClick={onJournal}
                        className="rounded-2xl bg-white/20 px-5 py-2.5 text-sm font-bold backdrop-blur-sm transition hover:bg-white/30"
                    >
                        📝 Journal
                    </button>

                    <button
                        onClick={onLogout}
                        className="rounded-2xl bg-white/10 px-5 py-2.5 text-sm font-bold text-white/80 backdrop-blur-sm transition hover:bg-white/20"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </section>
    );
}