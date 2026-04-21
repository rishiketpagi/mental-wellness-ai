import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const moodToValue = { Sad: 1, Stressed: 2, Neutral: 3, Happy: 4 };
const valueToMood = { 1: "Sad", 2: "Stressed", 3: "Neutral", 4: "Happy" };

const moodColor = {
    1: "#3b82f6",  // Sad → blue
    2: "#ef4444",  // Stressed → red
    3: "#eab308",  // Neutral → yellow
    4: "#22c55e",  // Happy → green
};

function MoodChart({ moods }) {
    const sorted = [...moods].sort((a, b) => {
        const aT = a.createdAt?.toDate?.()?.getTime?.() || 0;
        const bT = b.createdAt?.toDate?.()?.getTime?.() || 0;
        return aT - bT;
    });

    const labels = sorted.map((m) =>
        m.createdAt
            ? m.createdAt.toDate().toLocaleDateString("en-IN", { day: "numeric", month: "short" })
            : "–"
    );
    const values = sorted.map((m) => moodToValue[m.mood] || 0);
    const pointColors = values.map((v) => moodColor[v] || "#6366f1");

    const data = {
        labels,
        datasets: [
            {
                label: "Mood",
                data: values,
                tension: 0.4,
                fill: true,
                backgroundColor: (ctx) => {
                    const chart = ctx.chart;
                    const { ctx: c, chartArea } = chart;
                    if (!chartArea) return "transparent";
                    const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                    gradient.addColorStop(0, "rgba(99,102,241,0.18)");
                    gradient.addColorStop(1, "rgba(99,102,241,0)");
                    return gradient;
                },
                borderColor: "#6366f1",
                borderWidth: 2.5,
                pointBackgroundColor: pointColors,
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: "index" },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: "#1e1b4b",
                titleColor: "#a5b4fc",
                bodyColor: "#e0e7ff",
                padding: 10,
                cornerRadius: 10,
                callbacks: {
                    label: (ctx) => ` ${valueToMood[ctx.raw] || "Unknown"}`,
                },
            },
        },
        scales: {
            x: {
                ticks: {
                    maxRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: 6,
                    color: "#9ca3af",
                    font: { size: 11, family: "Manrope, sans-serif" },
                },
                grid: { display: false },
                border: { display: false },
            },
            y: {
                min: 0.5,
                max: 4.5,
                grid: { color: "rgba(99,102,241,0.07)" },
                border: { display: false },
                ticks: {
                    stepSize: 1,
                    color: "#9ca3af",
                    font: { size: 11, family: "Manrope, sans-serif" },
                    callback: (v) => valueToMood[v] || "",
                },
            },
        },
    };

    if (!moods || moods.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50 to-white p-8 text-center">
                <div className="mb-3 text-4xl">📊</div>
                <p className="text-sm font-semibold text-gray-700">No mood data yet</p>
                <p className="mt-1 text-xs text-gray-500">Log a few moods to see your emotional trend chart here.</p>
            </div>
        );
    }

    return (
        <div className="h-56 sm:h-64 lg:h-80">
            <Line data={data} options={options} />
        </div>
    );
}

export default MoodChart;