import type { Metadata } from "next";
import Link from "next/link";
import { DM_Sans, Space_Grotesk, Syne } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Poll Pulse",
  description: "Live poll app challenge",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${spaceGrotesk.variable} ${syne.variable} antialiased`}
      >
        <div className="app-root">
          <header className="app-header">
            <div className="app-header-inner">
              <Link className="app-brand" href="/">
                Poll Pulse
              </Link>
              <p className="app-tagline">Live Polling Demo</p>
            </div>
          </header>
          <div className="app-body">{children}</div>
        </div>
      </body>
    </html>
  );
}
