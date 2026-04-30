import { S } from "../../utils/loginStyles";

export default function AuthTabs({ tab, setTab }) {
    return (
        <div style={S.tabs}>
            <button style={S.tab(tab === "login")} onClick={() => setTab("login")}>Sign In</button>
            <button style={S.tab(tab === "signup")} onClick={() => setTab("signup")}>Create Account</button>
        </div>
    );
}
