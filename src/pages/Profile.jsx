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

function Profile() {
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

    const fetchProfileData = async () => {
        try {
            if (!user) return;

            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const data = userSnap.data();
                setDisplayName(data.displayName || "");
                setTempName(data.displayName || "");
            }

            const moodQuery = query(
                collection(db, "moods"),
                where("userId", "==", user.uid)
            );
            const moodSnap = await getDocs(moodQuery);
            setMoodCount(moodSnap.size);

            const journalQuery = query(
                collection(db, "journals"),
                where("userId", "==", user.uid)
            );
            const journalSnap = await getDocs(journalQuery);
            setJournalCount(journalSnap.size);

            const moods = moodSnap.docs.map((item) => item.data());

            const uniqueDates = new Set(
                moods
                    .filter((item) => item.createdAt)
                    .map((item) => {
                        const date = item.createdAt.toDate();
                        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
                    })
            );

            let streakCount = 0;
            const today = new Date();

            for (let i = 0; i < 365; i++) {
                const checkDate = new Date();
                checkDate.setDate(today.getDate() - i);

                const key = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;

                if (uniqueDates.has(key)) {
                    streakCount++;
                } else {
                    break;
                }
            }

            setStreak(streakCount);
        } catch (error) {
            console.error("Profile fetch error:", error.message);
        }
    };

    useEffect(() => {
        if (user) {
            fetchProfileData();
        }
    }, [user]);

    const handleSaveName = async () => {
        try {
            if (!user) return;

            const trimmedName = tempName.trim();

            if (!trimmedName) {
                alert("Display name cannot be empty.");
                return;
            }

            setSavingName(true);

            await updateDoc(doc(db, "users", user.uid), {
                displayName: trimmedName,
            });

            setDisplayName(trimmedName);
            setTempName(trimmedName);
            setEditing(false);
        } catch (error) {
            console.error("Update name error:", error.message);
            alert("Failed to update profile");
        } finally {
            setSavingName(false);
        }
    };

    const handleResendVerification = async () => {
        try {
            if (!user || !user.email || user.emailVerified) return;

            setSendingVerification(true);
            await sendEmailVerification(user);
            alert("Verification email sent. Please check your inbox.");
        } catch (error) {
            console.error("Verification email error:", error.message);
            alert("Failed to send verification email.");
        } finally {
            setSendingVerification(false);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("/");
        } catch (error) {
            console.error("Logout error:", error.message);
        }
    };

    const getInitial = () => {
        if (displayName?.trim()) return displayName.trim()[0].toUpperCase();
        if (user?.email) return user.email[0].toUpperCase();
        return "U";
    };

    const getPreferredName = () => {
        if (displayName?.trim()) return displayName.trim();
        if (user?.displayName?.trim()) return user.displayName.trim();
        if (user?.email) return user.email.split("@")[0];
        return "there";
    };

    const preferredName = getPreferredName();

    return (
        <div className="mx-auto w-full max-w-6xl space-y-3 sm:space-y-4">
            {/* Header */}
            <section className="rounded-[28px] border border-gray-100 bg-white p-4 shadow-sm sm:p-6 md:p-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-xl font-bold text-indigo-700 shadow-sm sm:h-16 sm:w-16 sm:text-2xl">
                            {getInitial()}
                        </div>

                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-500 sm:text-xs">
                                Your Profile
                            </p>
                            <h1 className="mt-1.5 text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">
                                Hi, {preferredName}
                            </h1>
                            <p className="mt-1 max-w-2xl text-xs text-gray-500 sm:text-sm md:text-base">
                                View your account details, track your activity, and personalize
                                your profile in one place.
                            </p>

                            <div className="mt-3 flex flex-wrap gap-2">
                                <span className="max-w-full break-all rounded-full bg-indigo-100 px-3 py-1.5 text-xs font-semibold text-indigo-700 sm:text-sm">
                                    {user?.email || "Anonymous user"}
                                </span>

                                <span className="rounded-full bg-violet-100 px-3 py-1.5 text-xs font-semibold text-violet-700 sm:text-sm">
                                    {user?.isAnonymous ? "Anonymous account" : "Registered account"}
                                </span>

                                <span
                                    className={`rounded-full px-3 py-1.5 text-xs font-semibold sm:text-sm ${user?.emailVerified
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-amber-100 text-amber-700"
                                        }`}
                                >
                                    {user?.emailVerified ? "Email verified" : "Email not verified"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid w-full grid-cols-2 gap-2.5 sm:w-auto sm:flex sm:flex-wrap sm:gap-3">
                        <button
                            onClick={() => navigate("/journal")}
                            className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
                        >
                            Open Journal
                        </button>

                        <button
                            onClick={handleLogout}
                            className="rounded-xl bg-red-100 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-200"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </section>

            {/* Top stats */}
            <section className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 sm:gap-3 xl:grid-cols-4">
                <div className="rounded-2xl border border-gray-100 bg-white p-2.5 shadow-sm sm:p-3">
                    <p className="text-xs font-medium text-indigo-600 sm:text-sm">Mood Entries</p>
                    <h3 className="mt-0.5 text-xl font-bold text-indigo-800 sm:text-2xl">
                        {moodCount}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500 sm:text-sm">Tracked check-ins</p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-2.5 shadow-sm sm:p-3">
                    <p className="text-xs font-medium text-violet-600 sm:text-sm">Journal Entries</p>
                    <h3 className="mt-0.5 text-xl font-bold text-violet-800 sm:text-2xl">
                        {journalCount}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500 sm:text-sm">Saved reflections</p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-2.5 shadow-sm sm:p-3">
                    <p className="text-xs font-medium text-amber-600 sm:text-sm">Current Streak</p>
                    <h3 className="mt-0.5 text-base font-bold text-amber-800 sm:text-xl">
                        {streak > 0 ? `🔥 ${streak} day${streak === 1 ? "" : "s"}` : "Start today"}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500 sm:text-sm">Daily mood habit</p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-2.5 shadow-sm sm:p-3">
                    <p className="text-xs font-medium text-emerald-600 sm:text-sm">Account Status</p>
                    <h3 className="mt-0.5 text-base font-bold text-emerald-800 sm:text-xl">
                        {user?.isAnonymous ? "Guest" : "Active"}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500 sm:text-sm">Current access mode</p>
                </div>
            </section>

            {/* Main content */}
            <section className="grid gap-4 lg:grid-cols-2">
                {/* Personal info / edit */}
                <div className="rounded-[28px] border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div>
                            <h2 className="text-2xl font-semibold text-indigo-700">
                                Personal Details
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Manage your profile information
                            </p>
                        </div>

                        {!editing && (
                            <button
                                onClick={() => setEditing(true)}
                                className="rounded-xl bg-indigo-100 text-indigo-700 px-4 py-2 font-medium hover:bg-indigo-200 transition"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>

                    <div className="mt-5 space-y-4">
                        <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-4">
                            <p className="text-sm text-indigo-600 font-medium">Email</p>
                            <p className="text-gray-800 mt-1 break-all">
                                {user?.email || "Anonymous user"}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-violet-50 border border-violet-100 p-4">
                            <p className="text-sm text-violet-600 font-medium">Account Type</p>
                            <p className="text-gray-800 mt-1">
                                {user?.isAnonymous ? "Anonymous" : "Registered"}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4">
                            <div className="flex items-start justify-between gap-4 flex-wrap">
                                <div>
                                    <p className="text-sm text-blue-600 font-medium">
                                        Email Verification
                                    </p>
                                    <p className="text-gray-800 mt-1">
                                        {user?.emailVerified ? "Verified" : "Not verified yet"}
                                    </p>
                                </div>

                                {!user?.isAnonymous && !user?.emailVerified && (
                                    <button
                                        onClick={handleResendVerification}
                                        disabled={sendingVerification}
                                        className="rounded-xl bg-white border border-blue-200 text-blue-700 px-4 py-2 text-sm font-medium hover:bg-blue-50 transition disabled:opacity-60"
                                    >
                                        {sendingVerification ? "Sending..." : "Resend Email"}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
                            <p className="text-sm text-emerald-600 font-medium">Display Name</p>

                            {editing ? (
                                <div className="mt-3 space-y-3">
                                    <p className="text-xs text-emerald-700">
                                        Choose a name you feel comfortable seeing in your dashboard.
                                    </p>
                                    <input
                                        type="text"
                                        value={tempName}
                                        onChange={(e) => setTempName(e.target.value)}
                                        placeholder="Enter display name"
                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-300"
                                    />

                                    <div className="flex gap-2 flex-wrap">
                                        <button
                                            onClick={handleSaveName}
                                            disabled={savingName}
                                            className="rounded-xl bg-emerald-600 text-white px-4 py-2 hover:bg-emerald-700 transition disabled:opacity-60"
                                        >
                                            {savingName ? "Saving..." : "Save"}
                                        </button>

                                        <button
                                            onClick={() => {
                                                setEditing(false);
                                                setTempName(displayName);
                                            }}
                                            className="rounded-xl bg-gray-100 text-gray-700 px-4 py-2 hover:bg-gray-200 transition"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-3">
                                    <p className="text-gray-800">
                                        {displayName || "No display name set"}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Activity / quick actions */}
                <div className="rounded-[28px] border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
                    <div>
                        <h2 className="text-xl font-semibold text-violet-700 sm:text-2xl">
                            Progress & Quick Actions
                        </h2>
                        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                            A quick look at your progress and useful actions
                        </p>
                    </div>

                    <div className="mt-5 space-y-4">
                        <div className="rounded-2xl bg-violet-50 border border-violet-100 p-4">
                            <p className="text-sm text-violet-600 font-medium">Progress Summary</p>
                            <p className="text-gray-700 mt-2 leading-relaxed">
                                You have logged <span className="font-semibold">{moodCount}</span> mood
                                entries and written <span className="font-semibold">{journalCount}</span>{" "}
                                journal reflections so far.
                            </p>
                        </div>

                        <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4">
                            <p className="text-sm text-amber-600 font-medium">Consistency</p>
                            <p className="text-gray-700 mt-2 leading-relaxed">
                                {streak > 0
                                    ? `You're on a ${streak}-day mood check-in streak. Keep it going.`
                                    : "You can begin your streak today with one small mood check-in."}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <button
                                onClick={() => navigate("/mood")}
                                className="rounded-2xl bg-indigo-100 px-4 py-3 text-left text-sm font-medium text-indigo-700 transition hover:bg-indigo-200"
                            >
                                <div className="text-base">😊</div>
                                <div className="mt-1.5">Log Mood</div>
                            </button>

                            <button
                                onClick={() => navigate("/journal")}
                                className="rounded-2xl bg-violet-100 px-4 py-3 text-left text-sm font-medium text-violet-700 transition hover:bg-violet-200"
                            >
                                <div className="text-base">📝</div>
                                <div className="mt-1.5">Write Journal</div>
                            </button>

                            <button
                                onClick={() => navigate("/chat")}
                                className="rounded-2xl bg-emerald-100 px-4 py-3 text-left text-sm font-medium text-emerald-700 transition hover:bg-emerald-200"
                            >
                                <div className="text-base">💬</div>
                                <div className="mt-1.5">Open Chat</div>
                            </button>

                            <button
                                onClick={() => navigate("/resources")}
                                className="rounded-2xl bg-teal-100 px-4 py-3 text-left text-sm font-medium text-teal-700 transition hover:bg-teal-200"
                            >
                                <div className="text-base">🌿</div>
                                <div className="mt-1.5">View Resources</div>
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Profile;