import type { Metadata } from "next";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import { Navbar } from "@/components/layout/navbar";
import { CommandPalette } from "@/components/ui/command-palette";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "MyRepo — MCP Dashboard",
  description: "Interface for interacting with MCP servers and analyzing documents.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider>
          <ToastProvider>
            <a href="#main-content" className="skip-link">
              Aller au contenu principal
            </a>
            <Navbar />
            <CommandPalette />
            <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              {children}
            </main>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
