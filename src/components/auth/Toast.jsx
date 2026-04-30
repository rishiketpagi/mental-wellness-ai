import { S } from "../../utils/loginStyles";

export default function Toast({ message, type, onClose }) {
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
