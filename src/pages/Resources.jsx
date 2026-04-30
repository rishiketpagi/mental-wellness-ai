import { useNavigate } from "react-router-dom";
import { RESOURCES } from "../utils/resourcesUtils";
import ResourcesHeader from "../components/resources/ResourcesHeader";
import ResourceCard from "../components/resources/ResourceCard";

function Resources() {
    const navigate = useNavigate();

    return (
        <section className="mx-auto w-full max-w-6xl space-y-4">
            <ResourcesHeader onBack={() => navigate("/home")} />

            {/* Resource grid */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {RESOURCES.map((item, index) => (
                    <ResourceCard key={index} item={item} index={index} />
                ))}
            </div>
        </section>
    );
}

export default Resources;