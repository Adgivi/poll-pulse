import type { Metadata } from "next";
import Link from "next/link";
import { Bricolage_Grotesque, DM_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage-grotesque",
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
        className={`${dmSans.variable} ${spaceGrotesk.variable} ${bricolageGrotesque.variable} antialiased`}
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
