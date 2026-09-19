import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/auth/SessionProvider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], weight: ["200", "300", "400", "500"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["100", "400", "600"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "My Movies",
  description: "Your personal cinematic universe",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrains.variable}`}>
      <body className={`font-sans bg-[#1a1a1a] text-[#c8c4bc] antialiased min-h-screen relative overflow-x-hidden selection:bg-[#8b3a2a] selection:text-[#c8c4bc]`}>
        {/* Edge Lines */}
        <div className="fixed top-0 bottom-0 left-4 sm:left-12 w-[1px] bg-[#c8c4bc]/10 z-0 pointer-events-none"></div>
        <div className="fixed top-0 bottom-0 right-4 sm:right-12 w-[1px] bg-[#c8c4bc]/10 z-0 pointer-events-none"></div>
        
        <SessionProvider>
          <div className="relative z-10">
            {children}
          </div>
          <Toaster 
            theme="dark" 
            position="top-center" 
            toastOptions={{
              style: { background: '#1a1a1a', border: '1px solid rgba(200,196,188,0.1)', color: '#c8c4bc', fontFamily: 'var(--font-jetbrains)' }
            }}
          />
        </SessionProvider>
      </body>
    </html>
  );
}
