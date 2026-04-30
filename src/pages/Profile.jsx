import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { auth } from "../firebase";
import { signOut, sendEmailVerification } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { uploadProfilePicture } from "../services/uploadService";
import {
    getProfileDetails,
    updateDisplayName,
    savePhotoURL,
    fetchProfileStats,
    updateProfileDetails,
} from "../services/profileService";

import ProfileHero from "../components/profile/ProfileHero";
import ProfileStats from "../components/profile/ProfileStats";
import AccountDetails from "../components/profile/AccountDetails";
import PersonalDetails from "../components/profile/PersonalDetails";
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

    // Personal details state
    const [age, setAge] = useState("");
    const [gender, setGender] = useState("Prefer not to say");
    const [bio, setBio] = useState("");
    const [editingDetails, setEditingDetails] = useState(false);
    const [tempAge, setTempAge] = useState("");
    const [tempGender, setTempGender] = useState("Prefer not to say");
    const [tempBio, setTempBio] = useState("");
    const [savingDetails, setSavingDetails] = useState(false);

    useEffect(() => {
        if (!user) return;

        const loadProfile = async () => {
            try {
                // Fetch profile from Firestore (photoURL comes from here, not Firebase Auth)
                const profile = await getProfileDetails(user.uid);
                setDisplayName(profile.displayName);
                setTempName(profile.displayName);
                setPhotoURL(profile.photoURL);
                setAge(profile.age);
                setGender(profile.gender);
                setBio(profile.bio);
                setTempAge(profile.age);
                setTempGender(profile.gender);
                setTempBio(profile.bio);

                // Fetch stats
                const stats = await fetchProfileStats(user.uid);
                setMoodCount(stats.moodCount);
                setJournalCount(stats.journalCount);
                setStreak(stats.streak);
            } catch (e) {
                console.error(e);
            }
        };

        loadProfile();
    }, [user]);

    const handleSaveName = async () => {
        const name = tempName.trim();
        if (!user || !name) return;

        setSavingName(true);
        try {
            await updateDisplayName(user.uid, name);
            setDisplayName(name);
            setEditing(false);
            setBanner({ ok: true, msg: "Display name updated!" });
        } catch (e) {
            console.error(e);
            setBanner({ ok: false, msg: "Failed to update name." });
        } finally {
            setSavingName(false);
            setTimeout(() => setBanner(null), 4000);
        }
    };

    const handleSaveDetails = async () => {
        if (!user) return;

        setSavingDetails(true);
        try {
            await updateProfileDetails(user.uid, {
                age: tempAge,
                gender: tempGender,
                bio: tempBio,
            });
            setAge(tempAge);
            setGender(tempGender);
            setBio(tempBio);
            setEditingDetails(false);
            setBanner({ ok: true, msg: "Personal details updated!" });
        } catch (e) {
            console.error(e);
            setBanner({ ok: false, msg: "Failed to update details." });
        } finally {
            setSavingDetails(false);
            setTimeout(() => setBanner(null), 4000);
        }
    };

    const handleCancelEditDetails = () => {
        setEditingDetails(false);
        setTempAge(age);
        setTempGender(gender);
        setTempBio(bio);
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
            // Upload to Cloudinary
            const imageUrl = await uploadProfilePicture(file);
            // Save to Firestore users/{uid}
            await savePhotoURL(user.uid, imageUrl);
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

            <PersonalDetails
                age={age}
                gender={gender}
                bio={bio}
                editing={editingDetails}
                setEditing={setEditingDetails}
                tempAge={tempAge}
                setTempAge={setTempAge}
                tempGender={tempGender}
                setTempGender={setTempGender}
                tempBio={tempBio}
                setTempBio={setTempBio}
                saving={savingDetails}
                onSave={handleSaveDetails}
                onCancel={handleCancelEditDetails}
            />

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