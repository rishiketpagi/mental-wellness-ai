import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db, auth } from "../firebase";
import { signOut, sendEmailVerification } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
    doc,
    getDoc,
    updateDoc,
    collection,
    query,
    where,
    getDocs,
} from "firebase/firestore";
import { uploadProfilePicture } from "../services/uploadService";

/* ── inject keyframes once ─────────────────────────────────────────────── */
if (!document.getElementById("profile-kf")) {
    const s = document.createElement("style");
    s.id = "profile-kf";
    s.textContent = `
    @keyframes fadeUp {
      from { opacity:0; transform:translateY(16px); }
      to   { opacity:1; transform:translateY(0);    }
    }
    @keyframes ringFill {
      from { stroke-dashoffset: 251; }
    }
    .profile-fade { animation: fadeUp 0.4s ease both; }
    .profile-fade-1 { animation-delay: 0.05s; }
    .profile-fade-2 { animation-delay: 0.10s; }
    .profile-fade-3 { animation-delay: 0.15s; }
    .profile-fade-4 { animation-delay: 0.20s; }
    `;
    document.head.appendChild(s);
}

/* ── Mini progress ring ────────────────────────────────────────────────── */
function Ring({ pct, color, size = 64, stroke = 6 }) {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ * (1 - Math.min(pct, 1));
    return (
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
            <circle
                cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke={color} strokeWidth={stroke}
                strokeDasharray={circ}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 1s ease" }}
            />
        </svg>
    );
}

/* ── Stat pill ──────────────────────────────────────────────────────────── */
function StatCard({ icon, label, value, sub, gradient, delay }) {
    return (
        <div className={`profile-fade ${delay} flex flex-col items-center gap-1 rounded-3xl bg-gradient-to-b ${gradient} p-5 text-center shadow-sm`}>
            <span className="text-3xl">{icon}</span>
            <p className="mt-1 text-2xl font-extrabold text-gray-900 sm:text-3xl">{value}</p>
            <p className="text-xs font-bold text-gray-600">{label}</p>
            <p className="text-[11px] text-gray-400">{sub}</p>
        </div>
    );
}

/* ── Info row ───────────────────────────────────────────────────────────── */
function InfoRow({ icon, label, value, aside }) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3.5 transition hover:bg-white hover:shadow-sm">
            <div className="flex items-center gap-3 min-w-0">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-base shadow-sm">
                    {icon}
                </span>
                <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
                    <p className="truncate text-sm font-semibold text-gray-800">{value}</p>
                </div>
            </div>
            {aside && <div className="shrink-0">{aside}</div>}
        </div>
    );
}

/* ── Quick action button ─────────────────────────────────────────────────── */
function ActionBtn({ emoji, label, sub, gradient, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`group flex flex-col items-start gap-1.5 rounded-2xl bg-gradient-to-br ${gradient} p-4 text-left text-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md`}
        >
            <span className="text-2xl transition-transform group-hover:scale-110">{emoji}</span>
            <p className="mt-1 text-sm font-bold">{label}</p>
            <p className="text-[11px] text-white/70">{sub}</p>
        </button>
    );
}

/* ════════════════════════════════════════════════════════════════════════ */
export default function Profile() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [displayName, setDisplayName] = useState("");
    const [editing, setEditing] = useState(false);
    const [tempName, setTempName] = useState("");
    const [moodCount, setMoodCount] = useState(0);
    const [journalCount, setJournalCount] = useState(0);
    const [streak, setStreak] = useState(0);
    const [savingName, setSavingName] = useState(false);
    const [sendingVerification, setSendingVerification] = useState(false);
    const [banner, setBanner] = useState(null);
    const [photoURL, setPhotoURL] = useState("");
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    /* fetch ─────────────────────────────────────────────────────────── */
    const fetchProfileData = async () => {
        if (!user) return;
        try {
            const snap = await getDoc(doc(db, "users", user.uid));
            if (snap.exists()) {
                const d = snap.data();
                setDisplayName(d.displayName || "");
                setTempName(d.displayName || "");
                setPhotoURL(d.photoURL || "");
            }
            const mSnap = await getDocs(query(collection(db, "moods"), where("userId", "==", user.uid)));
            setMoodCount(mSnap.size);
            const jSnap = await getDocs(query(collection(db, "journals"), where("userId", "==", user.uid)));
            setJournalCount(jSnap.size);

            const dates = new Set(
                mSnap.docs.map((d) => d.data()).filter((d) => d.createdAt).map((d) => {
                    const dt = d.createdAt.toDate();
                    return `${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}`;
                })
            );
            let s = 0;
            const today = new Date();
            for (let i = 0; i < 365; i++) {
                const c = new Date(); c.setDate(today.getDate() - i);
                const k = `${c.getFullYear()}-${c.getMonth()}-${c.getDate()}`;
                if (dates.has(k)) s++; else break;
            }
            setStreak(s);
        } catch (e) { console.error(e); }
    };
    useEffect(() => { if (user) fetchProfileData(); }, [user]);

    /* handlers ──────────────────────────────────────────────────────── */
    const handleSaveName = async () => {
        const name = tempName.trim();
        if (!user || !name) return;
        setSavingName(true);
        try {
            await updateDoc(doc(db, "users", user.uid), { displayName: name });
            setDisplayName(name);
            setEditing(false);
        } catch (e) { console.error(e); }
        finally { setSavingName(false); }
    };

    const handleResendVerification = async () => {
        if (!user || !user.email || user.emailVerified) return;
        setSendingVerification(true);
        try {
            await sendEmailVerification(user);
            setBanner({ ok: true, msg: "Verification email sent! Check your inbox." });
        } catch {
            setBanner({ ok: false, msg: "Failed to send. Please try again." });
        } finally {
            setSendingVerification(false);
            setTimeout(() => setBanner(null), 5000);
        }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        if (!file.type.startsWith("image/")) {
            setBanner({ ok: false, msg: "Please select a valid image file." });
            return;
        }

        setUploadingPhoto(true);

        try {
            const imageUrl = await uploadProfilePicture(file);

            await updateDoc(doc(db, "users", user.uid), {
                photoURL: imageUrl,
            });

            setPhotoURL(imageUrl);
            setBanner({ ok: true, msg: "Profile picture updated!" });
        } catch (error) {
            console.error(error);
            setBanner({ ok: false, msg: "Failed to upload photo. Try again." });
        } finally {
            setUploadingPhoto(false);
            setTimeout(() => setBanner(null), 4000);
        }
    };

    const handleLogout = async () => {
        try { await signOut(auth); navigate("/"); } catch (e) { console.error(e); }
    };

    /* display helpers ───────────────────────────────────────────────── */
    const initial = displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";
    const name = displayName?.trim() || user?.displayName?.trim() || user?.email?.split("@")[0] || "there";

    /* streak ring: cap at 30 days for 100% */
    const streakPct = Math.min(streak / 30, 1);
    const moodPct = Math.min(moodCount / 50, 1);
    const jPct = Math.min(journalCount / 20, 1);

    /* ── render ─────────────────────────────────────────────────────── */
    return (
        <div className="mx-auto w-full max-w-5xl space-y-4">

            {/* ── Toast banner ──────────────────────────────────────── */}
            {banner && (
                <div className={`profile-fade rounded-2xl border px-4 py-3 text-sm font-semibold ${banner.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}>
                    {banner.msg}
                </div>
            )}

            {/* ── Hero banner ───────────────────────────────────────── */}
            <section className="profile-fade relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-6 text-white shadow-xl sm:p-8">
                {/* Decorative blobs */}
                <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-purple-400/20 blur-2xl" />

                <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    {/* Avatar + name */}
                    <div className="flex items-center gap-5">
                        <div className="relative">
                            <label className="relative cursor-pointer group">
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
                                    onChange={handlePhotoUpload}
                                    className="hidden"
                                    disabled={uploadingPhoto}
                                />
                            </label>
                            {/* online dot */}
                            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-violet-600 bg-emerald-400 shadow" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Your Profile</p>
                            <h1 className="mt-1 text-2xl font-extrabold leading-tight sm:text-3xl">
                                Hi, {name}
                            </h1>
                            <div className="mt-2 flex flex-wrap gap-2">
                                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                                    {user?.email || "Anonymous"}
                                </span>
                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${user?.emailVerified ? "bg-emerald-400/30 text-emerald-100" : "bg-amber-400/30 text-amber-100"}`}>
                                    {user?.emailVerified ? "✓ Verified" : "⚠ Not verified"}
                                </span>
                                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                                    {user?.isAnonymous ? "Anonymous" : "Registered"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
                        <button
                            onClick={() => navigate("/journal")}
                            className="rounded-2xl bg-white/20 px-5 py-2.5 text-sm font-bold backdrop-blur-sm transition hover:bg-white/30"
                        >
                            📝 Journal
                        </button>
                        <button
                            onClick={handleLogout}
                            className="rounded-2xl bg-white/10 px-5 py-2.5 text-sm font-bold text-white/80 backdrop-blur-sm transition hover:bg-white/20"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </section>

            {/* ── Progress rings row ────────────────────────────────── */}
            <section className="profile-fade profile-fade-1 grid grid-cols-3 gap-3 sm:gap-4">
                {[
                    { icon: "😊", label: "Moods", count: moodCount, pct: moodPct, color: "#6366f1" },
                    { icon: "📝", label: "Journals", count: journalCount, pct: jPct, color: "#7c3aed" },
                    { icon: "🔥", label: "Day Streak", count: streak || "—", pct: streakPct, color: "#f59e0b" },
                ].map((s) => (
                    <div key={s.label} className="flex flex-col items-center gap-2 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
                        <div className="relative">
                            <Ring pct={s.pct} color={s.color} size={72} stroke={7} />
                            <div className="absolute inset-0 flex items-center justify-center text-xl">{s.icon}</div>
                        </div>
                        <p className="text-xl font-extrabold text-gray-900 sm:text-2xl">{s.count}</p>
                        <p className="text-xs font-bold text-gray-600">{s.label}</p>
                    </div>
                ))}
            </section>

            {/* ── Main grid ─────────────────────────────────────────── */}
            <div className="grid gap-4 lg:grid-cols-5">

                {/* Account info (3/5) */}
                <div className="profile-fade profile-fade-2 lg:col-span-3 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-extrabold text-gray-900 sm:text-lg">Account Details</h2>
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
                                        onClick={handleResendVerification}
                                        disabled={sendingVerification}
                                        className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
                                    >
                                        {sendingVerification ? "Sending…" : "Resend"}
                                    </button>
                                ) : null
                            }
                        />

                        {/* Display name row — editable inline */}
                        <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3.5 transition hover:bg-white hover:shadow-sm">
                            <div className="flex items-center gap-3">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-base shadow-sm">
                                    👤
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Display Name</p>
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
                                                    onClick={handleSaveName}
                                                    disabled={savingName}
                                                    className="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                                                >
                                                    {savingName ? "Saving…" : "Save"}
                                                </button>
                                                <button
                                                    onClick={() => { setEditing(false); setTempName(displayName); }}
                                                    className="rounded-xl bg-gray-200 px-4 py-1.5 text-xs font-bold text-gray-600 transition hover:bg-gray-300"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="mt-0.5 truncate text-sm font-semibold text-gray-800">
                                            {displayName || <span className="italic text-gray-400">Not set</span>}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick actions (2/5) */}
                <div className="profile-fade profile-fade-3 lg:col-span-2 flex flex-col gap-3">
                    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                        <h2 className="mb-3 text-base font-extrabold text-gray-900">Quick Actions</h2>
                        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-1">
                            <ActionBtn emoji="😊" label="Log Mood" sub="Quick check-in" gradient="from-indigo-500 to-indigo-600" onClick={() => navigate("/mood")} />
                            <ActionBtn emoji="📝" label="Write Journal" sub="Reflect & grow" gradient="from-violet-500 to-purple-600" onClick={() => navigate("/journal")} />
                            <ActionBtn emoji="💬" label="Open Chat" sub="Talk to AI" gradient="from-emerald-500 to-teal-600" onClick={() => navigate("/chat")} />
                            <ActionBtn emoji="🌿" label="Resources" sub="Tips & exercises" gradient="from-teal-500 to-cyan-600" onClick={() => navigate("/resources")} />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Milestone / motivation bar ────────────────────────── */}
            <section className="profile-fade profile-fade-4 rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 p-5 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-indigo-500">Your Journey</p>
                        <h3 className="mt-1 text-base font-extrabold text-indigo-900 sm:text-lg">
                            {streak > 0
                                ? `🔥 ${streak}-day streak — keep it going!`
                                : "Start your first streak today!"}
                        </h3>
                        <p className="mt-0.5 text-sm text-indigo-700">
                            {moodCount} mood logs · {journalCount} reflections · {streak > 0 ? `${streak} consecutive days` : "no active streak yet"}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/mood")}
                        className="self-start shrink-0 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:shadow-lg hover:-translate-y-0.5 sm:self-auto"
                    >
                        Check in now →
                    </button>
                </div>

                {/* simple progress bar for streak */}
                <div className="mt-4">
                    <div className="mb-1.5 flex justify-between text-xs font-semibold text-indigo-500">
                        <span>Streak progress</span>
                        <span>{streak} / 30 days</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-indigo-100">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700"
                            style={{ width: `${Math.min(streakPct * 100, 100)}%` }}
                        />
                    </div>
                </div>
            </section>

        </div>
    );
}