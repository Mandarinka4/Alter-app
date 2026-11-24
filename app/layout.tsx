import type { Metadata, Viewport } from "next";
import "@fontsource/unbounded/latin-600.css";
import "@fontsource/unbounded/latin-800.css";
import "@fontsource/unbounded/cyrillic-600.css";
import "@fontsource/unbounded/cyrillic-800.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alter · AI characters that remember you",
  description: "Chat with AI characters, or create your own.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0b0b10",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="sky" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
