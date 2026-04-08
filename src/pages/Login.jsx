import { useState } from "react";
import {
    signInAnonymously,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    sendEmailVerification,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
} from "firebase/auth";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showResendVerification, setShowResendVerification] = useState(false);
    const [pendingVerificationUser, setPendingVerificationUser] = useState(null);

    const saveUserToFirestore = async (user, isAnonymous) => {
        await setDoc(
            doc(db, "users", user.uid),
            {
                uid: user.uid,
                email: user.email || "",
                displayName: user.displayName || "",
                photoURL: user.photoURL || "",
                isAnonymous,
                emailVerified: user.emailVerified || false,
                createdAt: serverTimestamp(),
            },
            { merge: true }
        );
    };

    const getReadableAuthError = (error) => {
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
                return "Password should be at least 6 characters.";
            case "auth/popup-closed-by-user":
                return "Google sign-in was closed before completing.";
            case "auth/cancelled-popup-request":
                return "Another popup request is already in progress.";
            case "auth/account-exists-with-different-credential":
                return "An account already exists with this email using another sign-in method.";
            default:
                return error.message || "Something went wrong. Please try again.";
        }
    };

    const handleAnonymousLogin = async () => {
        try {
            const userCredential = await signInAnonymously(auth);
            await saveUserToFirestore(userCredential.user, true);
            navigate("/home");
        } catch (error) {
            alert(getReadableAuthError(error));
        }
    };

    const handleSignup = async () => {
        try {
            if (!email || !password) {
                alert("Please enter email and password");
                return;
            }

            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            await saveUserToFirestore(userCredential.user, false);
            await sendEmailVerification(userCredential.user);

            alert("Signup successful. A verification email has been sent to your inbox.");
            setShowResendVerification(true);
            setPendingVerificationUser(userCredential.user);
            navigate("/home");
        } catch (error) {
            console.error("Signup error:", error.message);
            alert(getReadableAuthError(error));
        }
    };

    const handleLogin = async () => {
        try {
            if (!email || !password) {
                alert("Please enter email and password");
                return;
            }

            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const loggedInUser = userCredential.user;

            await loggedInUser.reload();

            if (!loggedInUser.emailVerified) {
                setShowResendVerification(true);
                setPendingVerificationUser(loggedInUser);

                await signOut(auth);

                alert("Please verify your email before logging in.");
                return;
            }

            await saveUserToFirestore(loggedInUser, false);
            setShowResendVerification(false);
            setPendingVerificationUser(null);

            navigate("/home");
        } catch (error) {
            console.error("Login error:", error.message);
            alert(getReadableAuthError(error));
        }
    };

    const handleForgotPassword = async () => {
        try {
            if (!email) {
                alert("Please enter your email first");
                return;
            }

            await sendPasswordResetEmail(auth, email);
            alert("Password reset email sent. Please check your inbox.");
        } catch (error) {
            console.error("Forgot password error:", error.message);
            alert(getReadableAuthError(error));
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            const provider = new GoogleAuthProvider();
            provider.addScope("email");
            provider.addScope("profile");

            const userCredential = await signInWithPopup(auth, provider);
            await saveUserToFirestore(userCredential.user, false);

            setShowResendVerification(false);
            setPendingVerificationUser(null);

            navigate("/home");
        } catch (error) {
            console.error("Google sign-in error:", error.message);
            alert(getReadableAuthError(error));
        }
    };

    const handleResendVerification = async () => {
        try {
            if (pendingVerificationUser) {
                await sendEmailVerification(pendingVerificationUser);
                alert("Verification email sent again. Please check your inbox.");
                return;
            }

            if (!email || !password) {
                alert("Enter your email and password first.");
                return;
            }

            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const loggedInUser = userCredential.user;

            await loggedInUser.reload();

            if (loggedInUser.emailVerified) {
                alert("Your email is already verified. You can log in normally.");
                await signOut(auth);
                setShowResendVerification(false);
                setPendingVerificationUser(null);
                return;
            }

            await sendEmailVerification(loggedInUser);
            await signOut(auth);

            setShowResendVerification(true);
            setPendingVerificationUser(loggedInUser);

            alert("Verification email sent again. Please check your inbox.");
        } catch (error) {
            console.error("Resend verification error:", error.message);
            alert(getReadableAuthError(error));
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center px-3 py-6 sm:px-4 sm:py-10">
            <div className="w-full max-w-sm rounded-3xl border border-gray-100 bg-white p-5 shadow-xl sm:max-w-md sm:p-7">
                <h1 className="text-center text-2xl font-bold text-indigo-700 sm:text-3xl">
                    Mental Wellness AI
                </h1>
                <p className="mt-1.5 text-center text-xs text-gray-500 sm:mt-2 sm:text-sm">
                    A calm and private space for your daily check-ins
                </p>

                <div className="mt-7 space-y-3.5">
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-300"
                    />

                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2.5 sm:gap-3">
                    <button
                        onClick={handleSignup}
                        className="rounded-xl bg-indigo-600 py-3 text-sm font-medium text-white transition hover:bg-indigo-700"
                    >
                        Sign Up
                    </button>

                    <button
                        onClick={handleLogin}
                        className="rounded-xl bg-violet-600 py-3 text-sm font-medium text-white transition hover:bg-violet-700"
                    >
                        Login
                    </button>
                </div>

                <div className="mt-3 text-center">
                    <button
                        onClick={handleForgotPassword}
                        className="text-sm text-indigo-600 hover:text-indigo-800 transition"
                    >
                        Forgot Password?
                    </button>
                </div>

                {showResendVerification && (
                    <div className="mt-4 rounded-2xl bg-amber-50 border border-amber-200 p-4">
                        <p className="text-sm text-amber-800">
                            Your email is not verified yet. Please verify it before logging in.
                        </p>
                        <button
                            onClick={handleResendVerification}
                            className="mt-3 w-full rounded-xl bg-amber-100 py-3 text-sm font-medium text-amber-800 transition hover:bg-amber-200"
                        >
                            Resend Verification Email
                        </button>
                    </div>
                )}

                <div className="mt-3">
                    <button
                        onClick={handleGoogleSignIn}
                        className="w-full rounded-xl border border-gray-300 bg-white py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                        Continue with Google
                    </button>
                </div>

                <div className="mt-3">
                    <button
                        onClick={handleAnonymousLogin}
                        className="w-full rounded-xl bg-gray-100 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
                    >
                        Continue Anonymously
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Login;