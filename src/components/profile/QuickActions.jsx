import ActionBtn from "./ActionBtn";

export default function ProfileQuickActions({ navigate }) {
    return (
        <div className="profile-fade profile-fade-3 flex flex-col gap-3 lg:col-span-2">
            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="mb-3 text-base font-extrabold text-gray-900">
                    Quick Actions
                </h2>

                <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-1">
                    <ActionBtn
                        emoji="😊"
                        label="Log Mood"
                        sub="Quick check-in"
                        gradient="from-indigo-500 to-indigo-600"
                        onClick={() => navigate("/mood")}
                    />

                    <ActionBtn
                        emoji="📝"
                        label="Write Journal"
                        sub="Reflect & grow"
                        gradient="from-violet-500 to-purple-600"
                        onClick={() => navigate("/journal")}
                    />

                    <ActionBtn
                        emoji="💬"
                        label="Open Chat"
                        sub="Talk to AI"
                        gradient="from-emerald-500 to-teal-600"
                        onClick={() => navigate("/chat")}
                    />

                    <ActionBtn
                        emoji="🌿"
                        label="Resources"
                        sub="Tips & exercises"
                        gradient="from-teal-500 to-cyan-600"
                        onClick={() => navigate("/resources")}
                    />
                </div>
            </div>
        </div>
    );
}