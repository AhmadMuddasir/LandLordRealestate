import HeroSection from "@/components/HeroSection";
import PropertiesSection from "../components/properties/PropertiesSection";
import RentalsSection from "../components/rentals/RentalsSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <HeroSection />
      <PropertiesSection limit={6} />
      <RentalsSection limit={6} showSearch={false} showViewAll={true} />
      <Footer></Footer>
    </main>
  );
}
