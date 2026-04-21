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

/* ─── Theme tokens (matches app's existing indigo/violet palette) ─────────── */
const T = {
    /* backgrounds */
    pageBg:     "linear-gradient(135deg, #eef5ff 0%, #f3f6ff 52%, #ffffff 100%)",
    orbA:       "radial-gradient(circle, #c7d2fe, #a5b4fc)",   /* indigo-200 → indigo-300 */
    orbB:       "radial-gradient(circle, #ddd6fe, #c4b5fd)",   /* violet-200 → violet-300 */
    orbC:       "radial-gradient(circle, #bfdbfe, #93c5fd)",   /* blue-200 → blue-300    */
    cardBg:     "#ffffff",
    cardBorder: "#e5e7eb",                                       /* gray-200              */

    /* brand */
    primary:    "#4f46e5",    /* indigo-600  */
    primaryHov: "#4338ca",    /* indigo-700  */
    accent:     "#7c3aed",    /* violet-600  */
    accentHov:  "#6d28d9",    /* violet-700  */

    /* text */
    textDark:   "#1f2937",    /* gray-800    */
    textMid:    "#6b7280",    /* gray-500    */
    textLight:  "#9ca3af",    /* gray-400    */

    /* inputs */
    inputBorder:      "#d1d5db",  /* gray-300 */
    inputBorderFocus: "#6366f1",  /* indigo-500 */
    inputShadowFocus: "rgba(99,102,241,0.15)",

    /* utility */
    dividerLine: "#e5e7eb",
    warnBg:     "#fffbeb",
    warnBorder: "#fde68a",
    warnText:   "#92400e",
};

/* ─── Inline style objects ─────────────────────────────────────────────────── */
const S = {
    page: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem 1rem",
        position: "relative",
        overflow: "hidden",
        background: T.pageBg,
    },
    orb: (size, top, left, color, delay) => ({
        position: "absolute",
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        top,
        left,
        filter: "blur(70px)",
        opacity: 0.55,
        animation: `floatOrb 9s ease-in-out ${delay} infinite alternate`,
        pointerEvents: "none",
    }),
    card: {
        position: "relative",
        zIndex: 10,
        width: "100%",
        maxWidth: "420px",
        borderRadius: "24px",
        background: T.cardBg,
        border: `1px solid ${T.cardBorder}`,
        boxShadow: "0 20px 60px rgba(79,70,229,0.1), 0 4px 16px rgba(15,23,42,0.06)",
        padding: "2.25rem 2rem",
    },
    logo: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.6rem",
        marginBottom: "0.45rem",
    },
    logoIcon: {
        width: 44,
        height: 44,
        borderRadius: "14px",
        background: "linear-gradient(135deg, #a78bfa, #6366f1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.45rem",
        boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
    },
    logoText: {
        fontSize: "1.35rem",
        fontWeight: 800,
        color: T.primary,
        letterSpacing: "-0.02em",
    },
    tagline: {
        textAlign: "center",
        color: T.textMid,
        fontSize: "0.8rem",
        marginBottom: "1.75rem",
    },
    tabs: {
        display: "flex",
        background: "#f3f4f6",
        borderRadius: "14px",
        padding: "4px",
        marginBottom: "1.6rem",
        border: "1px solid #e5e7eb",
    },
    tab: (active) => ({
        flex: 1,
        padding: "0.55rem",
        borderRadius: "10px",
        border: "none",
        cursor: "pointer",
        fontFamily: "inherit",
        fontSize: "0.875rem",
        fontWeight: 600,
        transition: "all 0.25s ease",
        background: active ? "linear-gradient(135deg, #818cf8, #6366f1)" : "transparent",
        color: active ? "#fff" : T.textMid,
        boxShadow: active ? "0 2px 10px rgba(99,102,241,0.35)" : "none",
    }),
    fieldWrap: { marginBottom: "0.95rem" },
    label: {
        display: "block",
        fontSize: "0.72rem",
        fontWeight: 700,
        color: T.textMid,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        marginBottom: "0.4rem",
    },
    input: {
        width: "100%",
        background: "#fafafa",
        border: `1px solid ${T.inputBorder}`,
        borderRadius: "12px",
        padding: "0.78rem 1rem",
        color: T.textDark,
        fontSize: "0.92rem",
        outline: "none",
        fontFamily: "inherit",
        transition: "border-color 0.2s, box-shadow 0.2s",
        boxSizing: "border-box",
    },
    inputFocus: {
        borderColor: T.inputBorderFocus,
        boxShadow: `0 0 0 3px ${T.inputShadowFocus}`,
        background: "#fff",
    },
    pwWrap: { position: "relative" },
    eyeBtn: {
        position: "absolute",
        right: "0.85rem",
        top: "50%",
        transform: "translateY(-50%)",
        background: "none",
        border: "none",
        cursor: "pointer",
        color: T.textLight,
        fontSize: "1.05rem",
        padding: 0,
        lineHeight: 1,
    },
    primaryBtn: (loading) => ({
        width: "100%",
        padding: "0.82rem",
        borderRadius: "14px",
        border: "none",
        cursor: loading ? "not-allowed" : "pointer",
        fontFamily: "inherit",
        fontSize: "0.95rem",
        fontWeight: 700,
        color: "#fff",
        background: loading
            ? "#c7d2fe"
            : "linear-gradient(135deg, #818cf8 0%, #6366f1 50%, #4f46e5 100%)",
        boxShadow: loading ? "none" : "0 4px 18px rgba(99,102,241,0.4)",
        transition: "all 0.25s ease",
        marginTop: "0.5rem",
    }),
    forgotBtn: {
        background: "none",
        border: "none",
        color: T.primary,
        cursor: "pointer",
        fontSize: "0.78rem",
        fontWeight: 600,
        fontFamily: "inherit",
        padding: 0,
        marginTop: "0.4rem",
        display: "block",
        marginLeft: "auto",
        transition: "color 0.2s",
    },
    divider: {
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        margin: "1.2rem 0",
        color: T.textLight,
        fontSize: "0.72rem",
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
    },
    dividerLine: {
        flex: 1,
        height: "1px",
        background: T.dividerLine,
    },
    googleBtn: {
        width: "100%",
        padding: "0.78rem",
        borderRadius: "14px",
        border: `1px solid ${T.cardBorder}`,
        background: "#fff",
        color: T.textDark,
        cursor: "pointer",
        fontFamily: "inherit",
        fontSize: "0.88rem",
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.55rem",
        transition: "background 0.2s, border-color 0.2s, box-shadow 0.2s",
        marginBottom: "0.65rem",
        boxShadow: "0 1px 4px rgba(15,23,42,0.06)",
    },
    anonBtn: {
        width: "100%",
        padding: "0.72rem",
        borderRadius: "14px",
        border: "1px solid #e5e7eb",
        background: "#f9fafb",
        color: T.textMid,
        cursor: "pointer",
        fontFamily: "inherit",
        fontSize: "0.83rem",
        fontWeight: 500,
        transition: "background 0.2s, color 0.2s",
    },
    verifyBanner: {
        background: T.warnBg,
        border: `1px solid ${T.warnBorder}`,
        borderRadius: "14px",
        padding: "0.9rem 1rem",
        marginTop: "1rem",
    },
    verifyText: {
        color: T.warnText,
        fontSize: "0.8rem",
        fontWeight: 500,
        marginBottom: "0.65rem",
    },
    resendBtn: {
        width: "100%",
        padding: "0.65rem",
        borderRadius: "10px",
        border: "1px solid #fde68a",
        background: "#fef3c7",
        color: T.warnText,
        cursor: "pointer",
        fontFamily: "inherit",
        fontSize: "0.82rem",
        fontWeight: 600,
        transition: "background 0.2s",
    },
    toast: (type) => ({
        position: "fixed",
        top: "1.5rem",
        right: "1.5rem",
        zIndex: 999,
        background: type === "error"
            ? "#fee2e2"
            : type === "warn"
                ? "#fef3c7"
                : "#d1fae5",
        color: type === "error"
            ? "#991b1b"
            : type === "warn"
                ? "#92400e"
                : "#065f46",
        border: type === "error"
            ? "1px solid #fca5a5"
            : type === "warn"
                ? "1px solid #fde68a"
                : "1px solid #6ee7b7",
        borderRadius: "14px",
        padding: "0.85rem 1.2rem",
        fontSize: "0.85rem",
        fontWeight: 600,
        maxWidth: "340px",
        boxShadow: "0 8px 32px rgba(15,23,42,0.12)",
        display: "flex",
        alignItems: "flex-start",
        gap: "0.6rem",
        animation: "slideDown 0.3s ease",
        fontFamily: "Manrope, sans-serif",
    }),
};

/* ─── Keyframes injected once ─────────────────────────────────────────────── */
if (!document.getElementById("login-kf")) {
    const style = document.createElement("style");
    style.id = "login-kf";
    style.textContent = `
    @keyframes floatOrb {
      from { transform: translateY(0) scale(1); }
      to   { transform: translateY(-36px) scale(1.07); }
    }
    @keyframes slideDown {
      from { opacity:0; transform: translateY(-14px); }
      to   { opacity:1; transform: translateY(0); }
    }
    #login-email::placeholder,
    #login-password::placeholder { color: #d1d5db; }
    #login-email:-webkit-autofill,
    #login-password:-webkit-autofill {
      -webkit-box-shadow: 0 0 0 1000px #fafafa inset !important;
      -webkit-text-fill-color: #1f2937 !important;
    }
    .lp-google:hover { background: #f5f3ff !important; border-color: #c7d2fe !important; box-shadow: 0 2px 10px rgba(99,102,241,0.12) !important; }
    .lp-anon:hover   { background: #f0f0ff !important; color: #4f46e5 !important; }
    .lp-primary:not([disabled]):hover  { filter: brightness(1.08); box-shadow: 0 6px 22px rgba(99,102,241,0.5) !important; transform: translateY(-1px); }
    .lp-primary:not([disabled]):active { transform: translateY(0); filter: brightness(0.96); }
    .lp-forgot:hover { color: #4338ca !important; text-decoration: underline; }
  `;
    document.head.appendChild(style);
}

/* ─── Toast ────────────────────────────────────────────────────────────────── */
function Toast({ message, type, onClose }) {
    const icons = { error: "✕", warn: "⚠", success: "✓", info: "ℹ" };
    return (
        <div style={S.toast(type)}>
            <span style={{ fontSize: "0.95rem", lineHeight: 1.3 }}>{icons[type] ?? "ℹ"}</span>
            <span style={{ flex: 1 }}>{message}</span>
            <button
                onClick={onClose}
                style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: "0.95rem", lineHeight: 1, padding: 0, marginLeft: "0.4rem", opacity: 0.6 }}
            >
                ✕
            </button>
        </div>
    );
}

/* ─── Google SVG ───────────────────────────────────────────────────────────── */
const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
        <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
);

/* ─── Input with focus glow ────────────────────────────────────────────────── */
function FocusInput({ id, type, placeholder, value, onChange, extraStyle }) {
    const [focused, setFocused] = useState(false);
    return (
        <input
            id={id}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{ ...S.input, ...(focused ? S.inputFocus : {}), ...extraStyle }}
            autoComplete={type === "password" ? "current-password" : "email"}
        />
    );
}

/* ─── Main component ───────────────────────────────────────────────────────── */
export default function Login() {
    const navigate = useNavigate();

    const [tab, setTab] = useState("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showResendVerification, setShowResendVerification] = useState(false);
    const [pendingVerificationUser, setPendingVerificationUser] = useState(null);
    const [toast, setToast] = useState(null);

    const notify = (message, type = "info", duration = 4500) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), duration);
    };

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
            case "auth/invalid-email":         return "Please enter a valid email address.";
            case "auth/user-not-found":        return "No account found with this email.";
            case "auth/wrong-password":
            case "auth/invalid-credential":    return "Incorrect email or password.";
            case "auth/email-already-in-use":  return "This email is already registered.";
            case "auth/weak-password":         return "Password must be at least 6 characters.";
            case "auth/popup-closed-by-user":  return "Google sign-in was closed before completing.";
            case "auth/cancelled-popup-request": return "Another popup is already in progress.";
            case "auth/account-exists-with-different-credential":
                return "An account already exists with this email using another sign-in method.";
            default: return error.message || "Something went wrong. Please try again.";
        }
    };

    const handleAnonymousLogin = async () => {
        setLoading(true);
        try {
            const userCredential = await signInAnonymously(auth);
            await saveUserToFirestore(userCredential.user, true);
            navigate("/home");
        } catch (error) {
            notify(getReadableAuthError(error), "error");
        } finally { setLoading(false); }
    };

    const handleSignup = async () => {
        if (!email || !password) { notify("Please enter your email and password.", "warn"); return; }
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await saveUserToFirestore(userCredential.user, false);
            await sendEmailVerification(userCredential.user);
            notify("Account created! A verification email has been sent.", "success");
            setShowResendVerification(true);
            setPendingVerificationUser(userCredential.user);
            navigate("/home");
        } catch (error) {
            notify(getReadableAuthError(error), "error");
        } finally { setLoading(false); }
    };

    const handleLogin = async () => {
        if (!email || !password) { notify("Please enter your email and password.", "warn"); return; }
        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const loggedInUser = userCredential.user;
            await loggedInUser.reload();
            if (!loggedInUser.emailVerified) {
                setShowResendVerification(true);
                setPendingVerificationUser(loggedInUser);
                await signOut(auth);
                notify("Please verify your email before logging in.", "warn");
                return;
            }
            await saveUserToFirestore(loggedInUser, false);
            setShowResendVerification(false);
            setPendingVerificationUser(null);
            navigate("/home");
        } catch (error) {
            notify(getReadableAuthError(error), "error");
        } finally { setLoading(false); }
    };

    const handleForgotPassword = async () => {
        if (!email) { notify("Enter your email address first.", "warn"); return; }
        try {
            await sendPasswordResetEmail(auth, email);
            notify("Password reset email sent. Check your inbox.", "success");
        } catch (error) {
            notify(getReadableAuthError(error), "error");
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
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
            notify(getReadableAuthError(error), "error");
        } finally { setLoading(false); }
    };

    const handleResendVerification = async () => {
        try {
            if (pendingVerificationUser) {
                await sendEmailVerification(pendingVerificationUser);
                notify("Verification email sent again. Check your inbox.", "success");
                return;
            }
            if (!email || !password) { notify("Enter your email and password first.", "warn"); return; }
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const loggedInUser = userCredential.user;
            await loggedInUser.reload();
            if (loggedInUser.emailVerified) {
                notify("Your email is already verified. You can log in.", "success");
                await signOut(auth);
                setShowResendVerification(false);
                setPendingVerificationUser(null);
                return;
            }
            await sendEmailVerification(loggedInUser);
            await signOut(auth);
            setShowResendVerification(true);
            setPendingVerificationUser(loggedInUser);
            notify("Verification email sent again.", "success");
        } catch (error) {
            notify(getReadableAuthError(error), "error");
        }
    };

    const submit = tab === "login" ? handleLogin : handleSignup;

    return (
        <>
            {toast && (
                <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
            )}

            <div style={S.page}>
                {/* Soft indigo/violet orbs matching the app's light theme */}
                <div style={S.orb("380px", "-100px", "-120px", T.orbA, "0s")} />
                <div style={S.orb("300px", "55%",   "62%",   T.orbB, "2.5s")} />
                <div style={S.orb("240px", "65%",   "-70px", T.orbC, "5s")} />

                <div style={S.card}>
                    {/* Logo */}
                    <div style={S.logo}>
                        <div style={S.logoIcon}>🧠</div>
                        <span style={S.logoText}>Mental Wellness AI</span>
                    </div>
                    <p style={S.tagline}>A calm, private space for your daily check-ins</p>

                    {/* Tab switcher */}
                    <div style={S.tabs}>
                        <button style={S.tab(tab === "login")}  onClick={() => setTab("login")}>Sign In</button>
                        <button style={S.tab(tab === "signup")} onClick={() => setTab("signup")}>Create Account</button>
                    </div>

                    {/* Email */}
                    <div style={S.fieldWrap}>
                        <label style={S.label} htmlFor="login-email">Email</label>
                        <FocusInput
                            id="login-email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    {/* Password */}
                    <div style={S.fieldWrap}>
                        <label style={S.label} htmlFor="login-password">Password</label>
                        <div style={S.pwWrap}>
                            <FocusInput
                                id="login-password"
                                type={showPw ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                extraStyle={{ paddingRight: "2.8rem" }}
                            />
                            <button
                                style={S.eyeBtn}
                                onClick={() => setShowPw((p) => !p)}
                                tabIndex={-1}
                                aria-label={showPw ? "Hide password" : "Show password"}
                            >
                                {showPw ? "🙈" : "👁"}
                            </button>
                        </div>
                    </div>

                    {/* Forgot password */}
                    {tab === "login" && (
                        <button className="lp-forgot" style={S.forgotBtn} onClick={handleForgotPassword}>
                            Forgot password?
                        </button>
                    )}

                    {/* Primary CTA */}
                    <button
                        className="lp-primary"
                        style={S.primaryBtn(loading)}
                        onClick={submit}
                        disabled={loading}
                    >
                        {loading
                            ? (tab === "login" ? "Signing in…" : "Creating account…")
                            : (tab === "login" ? "Sign In" : "Create Account")}
                    </button>

                    {/* Verification banner */}
                    {showResendVerification && (
                        <div style={S.verifyBanner}>
                            <p style={S.verifyText}>
                                📨 Your email isn't verified yet. Please verify it before signing in.
                            </p>
                            <button style={S.resendBtn} onClick={handleResendVerification}>
                                Resend Verification Email
                            </button>
                        </div>
                    )}

                    {/* Divider */}
                    <div style={S.divider}>
                        <span style={S.dividerLine} />
                        <span>or continue with</span>
                        <span style={S.dividerLine} />
                    </div>

                    {/* Google */}
                    <button
                        className="lp-google"
                        style={S.googleBtn}
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                    >
                        <GoogleIcon />
                        Continue with Google
                    </button>

                    {/* Anonymous */}
                    <button
                        className="lp-anon"
                        style={S.anonBtn}
                        onClick={handleAnonymousLogin}
                        disabled={loading}
                    >
                        👤 Continue anonymously
                    </button>
                </div>
            </div>
        </>
    );
}