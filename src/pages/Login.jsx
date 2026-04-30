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
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { saveUserToFirestore, getReadableAuthError } from "../services/authService";
import { T, S } from "../utils/loginStyles";
import Toast from "../components/auth/Toast";
import AuthTabs from "../components/auth/AuthTabs";
import FocusInput from "../components/auth/FocusInput";
import PasswordField from "../components/auth/PasswordField";
import GoogleButton from "../components/auth/GoogleButton";

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

/* ─── Main component ───────────────────────────────────────────────────────── */
export default function Login() {
    const navigate = useNavigate();

    const [tab, setTab] = useState("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showResendVerification, setShowResendVerification] = useState(false);
    const [pendingVerificationUser, setPendingVerificationUser] = useState(null);
    const [toast, setToast] = useState(null);

    const notify = (message, type = "info", duration = 4500) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), duration);
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
                {/* Soft indigo/violet orbs */}
                <div style={S.orb("380px", "-100px", "-120px", T.orbA, "0s")} />
                <div style={S.orb("300px", "55%", "62%", T.orbB, "2.5s")} />
                <div style={S.orb("240px", "65%", "-70px", T.orbC, "5s")} />

                <div style={S.card}>
                    {/* Logo */}
                    <div style={S.logo}>
                        <div style={S.logoIcon}>🧠</div>
                        <span style={S.logoText}>Calmora</span>
                    </div>
                    <p style={S.tagline}>A calm, private space for your daily check-ins</p>

                    {/* Tab switcher */}
                    <AuthTabs tab={tab} setTab={setTab} />

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
                        <PasswordField
                            id="login-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
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
                    <GoogleButton onClick={handleGoogleSignIn} disabled={loading} />

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