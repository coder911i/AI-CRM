import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { SocketProvider } from "@/lib/socket";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Waterting — AI-Powered Real Estate CRM",
  description: "The intelligent real estate CRM that helps you close more deals faster with AI-powered lead scoring, pipeline management, and automation.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <SocketProvider>
            {children}
            <Toaster position="top-right" />
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
