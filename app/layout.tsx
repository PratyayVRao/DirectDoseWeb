import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { Toaster } from "@/components/toaster"
import { Analytics } from "@vercel/analytics/react" // ✅ correct import

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DirectDose - Precision Insulin Dosing",
  description:
    "Calculate your mealtime insulin with confidence using our advanced carb counting and dosing algorithms.",
  generator: "v0.dev",
  icons: {
    icon: [
      { url: "/logo.png", sizes: "32x32", type: "image/png" },
      { url: "/logo.png", sizes: "192x192", type: "image/png" },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main>{children}</main>
        <Toaster />
        <Analytics /> {/* ✅ added Analytics here */}
      </body>
    </html>
  )
}
