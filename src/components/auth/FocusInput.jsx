import { useState } from "react";
import { S } from "../../utils/loginStyles";

export default function FocusInput({ id, type, placeholder, value, onChange, extraStyle }) {
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
