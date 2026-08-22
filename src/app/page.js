import HeroSection from "@/components/HeroSection";
import PropertiesSection from "./properties/PropertiesSection";
import RentalsSection from "./rentals/RentalsSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <HeroSection />
      <PropertiesSection limit={6} showSearch={false} showViewAll={true} />
      <RentalsSection limit={6} showSearch={false} showViewAll={true} />
    </main>
  );
}