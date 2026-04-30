export default function Ring({ pct, color, size = 64, stroke = 6 }) {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ * (1 - Math.min(pct, 1));

    return (
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
            <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth={stroke}
            />
            <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={color}
                strokeWidth={stroke}
                strokeDasharray={circ}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 1s ease" }}
            />
        </svg>
    );
}