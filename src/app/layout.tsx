import type { Metadata } from "next";
import { Suspense } from "react";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { FlashToast } from "@/components/providers/flash-toast";
import { ToasterProvider } from "@/components/providers/toaster-provider";
import { WhatsAppChat } from "@/components/storefront/whatsapp-chat";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <WhatsAppChat />
        <ToasterProvider />
        <Suspense fallback={null}>
          <FlashToast />
        </Suspense>
      </body>
    </html>
  );
}
