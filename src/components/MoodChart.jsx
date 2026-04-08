import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

function MoodChart({ moods }) {
    const moodToValue = {
        Sad: 1,
        Stressed: 2,
        Neutral: 3,
        Happy: 4,
    };

    const valueToMood = {
        1: "Sad",
        2: "Stressed",
        3: "Neutral",
        4: "Happy",
    };

    const sortedMoods = [...moods].sort((a, b) => {
        const aTime = a.createdAt?.toDate?.()?.getTime?.() || 0;
        const bTime = b.createdAt?.toDate?.()?.getTime?.() || 0;
        return aTime - bTime;
    });

    const labels = sortedMoods.map((item) => {
        if (!item.createdAt) return "No date";
        return item.createdAt.toDate().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
        });
    });

    const dataValues = sortedMoods.map((item) => moodToValue[item.mood] || 0);

    const data = {
        labels,
        datasets: [
            {
                label: "Mood Trend",
                data: dataValues,
                tension: 0.35,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: "top",
                labels: {
                    boxWidth: 8,
                    boxHeight: 8,
                    padding: 8,
                    usePointStyle: true,
                    font: {
                        size: 11,
                    },
                },
            },
            title: {
                display: true,
                text: "Your Mood Trend",
                font: {
                    size: 12,
                },
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const value = context.raw;
                        return ` Mood: ${valueToMood[value] || "Unknown"}`;
                    },
                },
            },
        },
        scales: {
            x: {
                ticks: {
                    maxRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: 4,
                    font: {
                        size: 10,
                    },
                },
                grid: {
                    display: false,
                },
            },
            y: {
                min: 1,
                max: 4,
                ticks: {
                    stepSize: 1,
                    font: {
                        size: 10,
                    },
                    callback: function (value) {
                        return valueToMood[value] || value;
                    },
                },
            },
        },
    };

    if (!moods || moods.length === 0) {
        return (
            <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-6 text-center">
                <p className="text-gray-600">No mood data yet for graph.</p>
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