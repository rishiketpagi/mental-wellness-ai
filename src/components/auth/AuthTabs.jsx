import { S } from "../../utils/loginStyles";

export default function AuthTabs({ tab, setTab }) {
    return (
        <div style={S.tabs}>
            {/* The animated sliding background */}
            <div style={S.activeIndicator(tab)} />

            <button 
                style={S.tab(tab === "login")} 
                onClick={() => setTab("login")}
            >
                Sign In
            </button>
            <button 
                style={S.tab(tab === "signup")} 
                onClick={() => setTab("signup")}
            >
                Sign Up
            </button>
        </div>
    );
}