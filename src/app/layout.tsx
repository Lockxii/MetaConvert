import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes"; // Import ThemeProvider

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
// High-contrast editorial serif — the brand voice (Ordalie-grounded).
const display = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "MetaConvert - Modern File Conversion & Transfer",
  description: "Convert files and upscale images with ease.",
  manifest: "/manifest.webmanifest",
  themeColor: "#16150F",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MetaConvert",
  },
  icons: {
    icon: "/favicon.png",
    apple: "/logo.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen font-sans antialiased",
          inter.variable,
          display.variable
        )}
        suppressHydrationWarning
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
        </ThemeProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
