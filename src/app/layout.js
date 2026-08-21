import { Geist, Geist_Mono } from "next/font/google";
import ToasterProvider from "./ToastProvider";
import "./globals.css";



export const metadata = {
  title: "LandLord",
  description: "buy and sell your land",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      <ToasterProvider />
      </body>

    </html>
  );
}
