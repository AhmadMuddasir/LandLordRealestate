import Navbar from "@/components/Navbar";
import ToasterProvider from "./ToastProvider";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "LandLord | Real Estate",
  description: "Buy, sell and rent properties with LandLord.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-white text-black antialiased">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <ToasterProvider />
        </AuthProvider>
      </body>
    </html>
  );
}
