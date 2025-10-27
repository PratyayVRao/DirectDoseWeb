"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Menu, X } from "lucide-react"
import type { User } from "@supabase/supabase-js"  

export function Navbar() {
  const pathname = usePathname()

  
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user) 
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getUser()

    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null) 
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase.auth])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  // Define navigation links
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/calculator", label: "Calculator" },
  ]

  // Auth-related links (always show here)
  const authLinks = [
    { href: "/icr-calculator", label: "ICR Calculator" },
    { href: "/basal-calculator", label: "Basal Calculator" },
    { href: "/FoodMood-main", label: "FoodMood" },
  ]

  const aboutLink = { href: "/about", label: "About Us" }

  return (
    <header className="sticky top-0 z-50 w-full bg-[#006c67] text-white shadow-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 relative">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DiabeteaseLogo-BG-bk6LGtoECw2WDKDg2nZIC8vFNsGCly.png"
              alt="DirectDose Logo"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-xl font-bold text-[#09fbb7]">DirectDose</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-3 sm:gap-4 md:gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-[#09fbb7] ${
                pathname === link.href ? "text-[#09fbb7]" : "text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {authLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-[#09fbb7] ${
                pathname === link.href || pathname.startsWith(link.href + "/") ? "text-[#09fbb7]" : "text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}

          <Link
            href={aboutLink.href}
            className={`text-sm font-medium transition-colors hover:text-[#09fbb7] ${
              pathname === aboutLink.href ? "text-[#09fbb7]" : "text-white"
            }`}
          >
            {aboutLink.label}
          </Link>

          {/* Profile or Login */}
          {isLoading ? (
            <span className="text-sm font-medium">Loading...</span>
          ) : user ? (
            <Link
              href="/profile"
              className={`text-sm font-medium transition-colors hover:text-[#09fbb7] ${
                pathname.startsWith("/profile") ? "text-[#09fbb7]" : "text-white"
              }`}
            >
              Profile
            </Link>
          ) : (
            <Link href="/login">
              <Button className="bg-[#09fbb7] hover:bg-[#08e0a5] text-[#006c67] font-medium">Login</Button>
            </Link>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-white p-2 focus:outline-none" onClick={toggleMenu} aria-label="Toggle menu">
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed top-16 right-0 h-screen w-64 bg-[#006c67] shadow-lg transform transition-transform duration-300 ease-in-out z-40 ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col p-4 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-[#09fbb7] ${
                pathname === link.href ? "text-[#09fbb7]" : "text-white"
              }`}
              onClick={closeMenu}
            >
              {link.label}
            </Link>
          ))}

          {authLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-[#09fbb7] ${
                pathname === link.href || pathname.startsWith(link.href + "/") ? "text-[#09fbb7]" : "text-white"
              }`}
              onClick={closeMenu}
            >
              {link.label}
            </Link>
          ))}

          <Link
            href={aboutLink.href}
            className={`text-sm font-medium transition-colors hover:text-[#09fbb7] ${
              pathname === aboutLink.href ? "text-[#09fbb7]" : "text-white"
            }`}
            onClick={closeMenu}
          >
            {aboutLink.label}
          </Link>

          {!isLoading && !user ? (
            <Link href="/login" onClick={closeMenu}>
              <Button className="w-full bg-[#09fbb7] hover:bg-[#08e0a5] text-[#006c67] font-medium">Login</Button>
            </Link>
          ) : (
            !isLoading &&
            user && (
              <Link
                href="/profile"
                className={`text-sm font-medium transition-colors hover:text-[#09fbb7] ${
                  pathname.startsWith("/profile") ? "text-[#09fbb7]" : "text-white"
                }`}
                onClick={closeMenu}
              >
                Profile
              </Link>
            )
          )}
        </div>
      </div>

      {/* Overlay for mobile menu */}
      {isMenuOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={closeMenu} />}
    </header>
  )
}
