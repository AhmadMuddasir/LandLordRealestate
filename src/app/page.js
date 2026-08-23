import HeroSection from "@/components/HeroSection";
import PropertiesSection from "./properties/PropertiesSection";
import RentalsSection from "./rentals/RentalsSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <HeroSection />
      <PropertiesSection limit={6} showSearch={false} showViewAll={true} />
      <RentalsSection limit={6} showSearch={false} showViewAll={true} />
      <Footer></Footer>
    </main>
  );
}