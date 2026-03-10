import { HeroSection } from "./HeroSection";
import { FeaturesSection } from "./FeaturesSection";
import { PublicDecksShowcase } from "./PublicDecksShowcase";
import { FaqSection } from "./FaqSection";
import { ContactSection } from "./ContactSection";

export default function HomePage() {
    return (
        <div className="home-page w-full overflow-x-hidden">
            <HeroSection />
            <FeaturesSection />
            <PublicDecksShowcase />
            <FaqSection />
            <ContactSection />
        </div>
    );
}
