import type { Metadata } from "next";
import "./globals.css";
import { GovBanner } from "@/components/shared/GovBanner";
import { StoreHydrator } from "@/components/StoreHydrator";

export const metadata: Metadata = {
  title: "LMOVS - Legal Metrology Online Verification System | Govt of India",
  description: "Official National Platform for Online Verification, Digital Stamping, and Lifecycle Management of Weighing and Measuring Instruments under Legal Metrology Act, 2009.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F3F4F6] text-[#111827] flex flex-col antialiased">
        <StoreHydrator />
        <GovBanner />
        <div className="flex-1 flex flex-col">{children}</div>
      </body>
    </html>
  );
}
