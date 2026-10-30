import type { Metadata } from "next";
import { Bodoni_Moda, Manrope } from "next/font/google";
import { FlashToast } from "@/components/providers/flash-toast";
import { ToasterProvider } from "@/components/providers/toaster-provider";
import { WhatsAppChat } from "@/components/storefront/whatsapp-chat";
import "./globals.css";

const bodoniModa = Bodoni_Moda({
  variable: "--font-bodoni-moda",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Wunmzy Co",
    template: "%s · Wunmzy Co",
  },
  description: "Fashion & Accessories — Outfit for every occasion. Be bold. Be confident. Be you.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  icons: {
    icon: [{ url: "/brand/wunmzy-logo.png", type: "image/png" }],
    apple: [{ url: "/brand/wunmzy-logo.png" }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${bodoniModa.variable} ${manrope.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <WhatsAppChat />
        <ToasterProvider />
        <FlashToast />
      </body>
    </html>
  );
}
