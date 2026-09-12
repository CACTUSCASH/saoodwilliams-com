import "./globals.css";
import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";

export const metadata: Metadata = {
  title: {
    default: "Sa'ood Williams | Full-stack engineer · Next.js · WebGL",
    template: "%s · Sa'ood Williams",
  },
  description:
    "Full-stack engineer shipping production Next.js 15 / TypeScript / WebGL applications. Available for contract at $120/hr.",
  metadataBase: new URL("https://saoodwilliams.com"),
  openGraph: {
    title: "Sa'ood Williams | Full-stack engineer",
    description: "Full-stack Next.js / WebGL / TypeScript. Available for contract.",
    url: "https://saoodwilliams.com",
    siteName: "saoodwilliams.com",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SiteNav />
        {children}
      </body>
    </html>
  );
}
