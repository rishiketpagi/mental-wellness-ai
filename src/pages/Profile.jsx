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

import ProfileHero from "../components/profile/ProfileHero";
import ProfileStats from "../components/profile/ProfileStats";
import AccountDetails from "../components/profile/AccountDetails";
import ProfileQuickActions from "../components/profile/QuickActions";
import JourneyProgress from "../components/profile/JourneyProgress";

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

            const mSnap = await getDocs(
                query(collection(db, "moods"), where("userId", "==", user.uid))
            );

            setMoodCount(mSnap.size);

            const jSnap = await getDocs(
                query(collection(db, "journals"), where("userId", "==", user.uid))
            );

            setJournalCount(jSnap.size);

            const dates = new Set(
                mSnap.docs
                    .map((d) => d.data())
                    .filter((d) => d.createdAt)
                    .map((d) => {
                        const dt = d.createdAt.toDate();
                        return `${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}`;
                    })
            );

            let s = 0;
            const today = new Date();

            for (let i = 0; i < 365; i++) {
                const c = new Date();
                c.setDate(today.getDate() - i);

                const k = `${c.getFullYear()}-${c.getMonth()}-${c.getDate()}`;

                if (dates.has(k)) s++;
                else break;
            }

            setStreak(s);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        if (user) fetchProfileData();
    }, [user]);

    const handleSaveName = async () => {
        const name = tempName.trim();
        if (!user || !name) return;

        setSavingName(true);

        try {
            await updateDoc(doc(db, "users", user.uid), {
                displayName: name,
            });

            setDisplayName(name);
            setEditing(false);
        } catch (e) {
            console.error(e);
        } finally {
            setSavingName(false);
        }
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
        try {
            await signOut(auth);
            navigate("/");
        } catch (e) {
            console.error(e);
        }
    };

    const handleCancelEdit = () => {
        setEditing(false);
        setTempName(displayName);
    };

    const initial =
        displayName?.[0]?.toUpperCase() ||
        user?.email?.[0]?.toUpperCase() ||
        "U";

    const name =
        displayName?.trim() ||
        user?.displayName?.trim() ||
        user?.email?.split("@")[0] ||
        "there";

    const streakPct = Math.min(streak / 30, 1);
    const moodPct = Math.min(moodCount / 50, 1);
    const jPct = Math.min(journalCount / 20, 1);

    return (
        <div className="mx-auto w-full max-w-5xl space-y-4">
            {banner && (
                <div
                    className={`profile-fade rounded-2xl border px-4 py-3 text-sm font-semibold ${banner.ok
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-red-200 bg-red-50 text-red-800"
                        }`}
                >
                    {banner.msg}
                </div>
            )}

            <ProfileHero
                user={user}
                name={name}
                initial={initial}
                photoURL={photoURL}
                uploadingPhoto={uploadingPhoto}
                onPhotoUpload={handlePhotoUpload}
                onJournal={() => navigate("/journal")}
                onLogout={handleLogout}
            />

            <ProfileStats
                moodCount={moodCount}
                journalCount={journalCount}
                streak={streak}
                moodPct={moodPct}
                jPct={jPct}
                streakPct={streakPct}
            />

            <div className="grid gap-4 lg:grid-cols-5">
                <AccountDetails
                    user={user}
                    editing={editing}
                    setEditing={setEditing}
                    tempName={tempName}
                    setTempName={setTempName}
                    displayName={displayName}
                    savingName={savingName}
                    sendingVerification={sendingVerification}
                    onSaveName={handleSaveName}
                    onCancelEdit={handleCancelEdit}
                    onResendVerification={handleResendVerification}
                />

                <ProfileQuickActions navigate={navigate} />
            </div>

            <JourneyProgress
                streak={streak}
                streakPct={streakPct}
                moodCount={moodCount}
                journalCount={journalCount}
                onCheckIn={() => navigate("/mood")}
            />
        </div>
    );
}