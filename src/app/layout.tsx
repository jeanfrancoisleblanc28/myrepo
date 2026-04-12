import type { Metadata } from "next";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Navbar } from "@/components/layout/navbar";
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
          <a href="#main-content" className="skip-link">
            Aller au contenu principal
          </a>
          <Navbar />
          <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
