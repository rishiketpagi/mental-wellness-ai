import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

/**
 * Fetch user profile data from Firestore.
 * Returns all profile fields including age, gender, bio.
 */
export async function fetchUserProfile(uid) {
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) {
        const d = snap.data();
        return {
            displayName: d.displayName || "",
            photoURL: d.photoURL || "",
            age: d.age || "",
            gender: d.gender || "Prefer not to say",
            bio: d.bio || "",
        };
    }
    return {
        displayName: "",
        photoURL: "",
        age: "",
        gender: "Prefer not to say",
        bio: "",
    };
}

/**
 * Update display name in Firestore users/{uid}.
 */
export async function updateDisplayName(uid, name) {
    await updateDoc(doc(db, "users", uid), { displayName: name });
}

/**
 * Save photoURL to Firestore users/{uid}.
 */
export async function savePhotoURL(uid, photoURL) {
    await updateDoc(doc(db, "users", uid), { photoURL });
}

/**
 * Update personal details (age, gender, bio) in Firestore.
 */
export async function updatePersonalDetails(uid, details) {
    const updateData = {};
    if (details.age !== undefined) updateData.age = details.age;
    if (details.gender !== undefined) updateData.gender = details.gender;
    if (details.bio !== undefined) updateData.bio = details.bio;

    if (Object.keys(updateData).length > 0) {
        await updateDoc(doc(db, "users", uid), updateData);
    }
}

/**
 * New wrapper to match requested API: getProfileDetails
 */
export async function getProfileDetails(uid) {
    return await fetchUserProfile(uid);
}

/**
 * New wrapper to match requested API: updateProfileDetails
 * Only updates provided fields and uses updateDoc under the hood.
 */
export async function updateProfileDetails(uid, data) {
    return await updatePersonalDetails(uid, data);
}

/**
 * Fetch profile stats: mood count, journal count, streak.
 */
export async function fetchProfileStats(uid) {
    const mSnap = await getDocs(
        query(collection(db, "moods"), where("userId", "==", uid))
    );
    const jSnap = await getDocs(
        query(collection(db, "journals"), where("userId", "==", uid))
    );

    const moodCount = mSnap.size;
    const journalCount = jSnap.size;

    // Calculate streak
    const dates = new Set(
        mSnap.docs
            .map((d) => d.data())
            .filter((d) => d.createdAt)
            .map((d) => {
                const dt = d.createdAt.toDate();
                return `${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}`;
            })
    );

    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
        const c = new Date();
        c.setDate(today.getDate() - i);
        const k = `${c.getFullYear()}-${c.getMonth()}-${c.getDate()}`;
        if (dates.has(k)) streak++;
        else break;
    }

    return { moodCount, journalCount, streak };
}
