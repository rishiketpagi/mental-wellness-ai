import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

/**
 * Save user to Firestore safely.
 * - If the user doc already exists: update ONLY safe fields.
 *   Preserve photoURL, age, gender, bio — never overwrite them.
 * - If user doc does NOT exist: create with defaults.
 */
export async function saveUserToFirestore(user, isAnonymous) {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
        // Existing user — update only auth-related fields, preserve everything else
        const existing = snap.data();
        await setDoc(
            userRef,
            {
                email: user.email || "",
                displayName: user.displayName || existing.displayName || "",
                emailVerified: user.emailVerified || false,
                isAnonymous,
            },
            { merge: true }
        );
    } else {
        // New user — create full doc with defaults
        await setDoc(userRef, {
            uid: user.uid,
            email: user.email || "",
            displayName: user.displayName || "",
            photoURL: user.photoURL || "",
            age: "",
            gender: "Prefer not to say",
            bio: "",
            isAnonymous,
            emailVerified: user.emailVerified || false,
            createdAt: serverTimestamp(),
        });
    }
}

/**
 * Readable Firebase Auth error messages.
 */
export function getReadableAuthError(error) {
    switch (error.code) {
        case "auth/invalid-email":
            return "Please enter a valid email address.";
        case "auth/user-not-found":
            return "No account found with this email.";
        case "auth/wrong-password":
        case "auth/invalid-credential":
            return "Incorrect email or password.";
        case "auth/email-already-in-use":
            return "This email is already registered.";
        case "auth/weak-password":
            return "Password must be at least 6 characters.";
        case "auth/popup-closed-by-user":
            return "Google sign-in was closed before completing.";
        case "auth/cancelled-popup-request":
            return "Another popup is already in progress.";
        case "auth/account-exists-with-different-credential":
            return "An account already exists with this email using another sign-in method.";
        default:
            return error.message || "Something went wrong. Please try again.";
    }
}
