import { useState } from "react";
import {
    signInAnonymously,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const saveUserToFirestore = async (user, isAnonymous) => {
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            email: user.email || "",
            isAnonymous,
            createdAt: serverTimestamp(),
        });
    };

    const handleAnonymousLogin = async () => {
        try {
            const userCredential = await signInAnonymously(auth);
            await saveUserToFirestore(userCredential.user, true);
            navigate("/home");
        } catch (error) {
            alert(error.message);
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
            navigate("/home");
        } catch (error) {
            alert(error.message);
        }
    };

    const handleLogin = async () => {
        try {
            if (!email || !password) {
                alert("Please enter email and password");
                return;
            }

            await signInWithEmailAndPassword(auth, email, password);
            navigate("/home");
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md rounded-3xl bg-white shadow-xl p-8 border border-gray-100">
                <h1 className="text-3xl font-bold text-center text-indigo-700">
                    Mental Wellness AI
                </h1>
                <p className="text-center text-gray-500 mt-2">
                    A calm and private space for your daily check-ins
                </p>

                <div className="mt-8 space-y-4">
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

                <div className="mt-6 grid grid-cols-2 gap-3">
                    <button
                        onClick={handleSignup}
                        className="rounded-xl bg-indigo-600 text-white py-3 font-medium hover:bg-indigo-700 transition"
                    >
                        Sign Up
                    </button>

                    <button
                        onClick={handleLogin}
                        className="rounded-xl bg-violet-600 text-white py-3 font-medium hover:bg-violet-700 transition"
                    >
                        Login
                    </button>
                </div>

                <div className="mt-4">
                    <button
                        onClick={handleAnonymousLogin}
                        className="w-full rounded-xl bg-gray-100 text-gray-700 py-3 font-medium hover:bg-gray-200 transition"
                    >
                        Continue Anonymously
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Login;