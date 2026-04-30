import { useState } from "react";
import { S } from "../../utils/loginStyles";

export default function PasswordField({ id, value, onChange }) {
    const [showPw, setShowPw] = useState(false);
    const [focused, setFocused] = useState(false);

    return (
        <div style={S.pwWrap}>
            <input
                id={id}
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                value={value}
                onChange={onChange}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                style={{ ...S.input, ...(focused ? S.inputFocus : {}), paddingRight: "2.8rem" }}
                autoComplete="current-password"
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
    );
}
