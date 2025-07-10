"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { GlucoseAnimation } from "@/components/glucose-animation"
import { createClient } from "@/utils/supabase/client"

const encouragingMessages = [
  "Sweet calculations ahead!",
  "You're doing grape at managing your health!",
  "Orange you glad you found DirectDose?",
  "Berry good choice using our calculator!",
  "You're one smart cookie (sugar-free, of course)!",
  "Donut worry, we've got your calculations covered!",
  "You're the apple of our app!",
  "Mint to be here!",
  "You're tea-rific at health management!",
  "Olive your dedication to wellness!",
]

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [username, setUsername] = useState<string>("")
  const [greeting, setGreeting] = useState("")
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          setUser(user)

          // Get username from profile
          const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).single()

          if (profile?.username) {
            setUsername(profile.username)
          } else {
            // Fallback to email if no username
            setUsername(user.email?.split("@")[0] || "Friend")
          }

          // Set random greeting
          const randomGreeting = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)]
          setGreeting(randomGreeting)
        }
      } catch (error) {
        console.error("Error checking auth:", error)
      }
    }

    checkAuth()
  }, [supabase])

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-teal-200/30 to-emerald-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-200/30 to-teal-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-teal-100/20 to-emerald-100/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            {user && (
              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-semibold text-[#006c67] mb-2">
                  Hi {username}! {greeting}
                </h2>
              </div>
            )}
            <h1 className="text-5xl md:text-7xl font-bold text-[#006c67] mb-6 leading-tight">DirectDose</h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              Changing the way the world manages insulin one dose at a time. 
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/calculator"
                className="px-8 py-4 bg-[#006c67] text-white rounded-full hover:bg-[#09fbb7] hover:text-[#006c67] transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Start Calculating
              </Link>
              {!user && (
                <Link
                  href="/login"
                  className="px-8 py-4 border-2 border-[#006c67] text-[#006c67] rounded-full hover:bg-[#006c67] hover:text-white transition-all duration-300 font-semibold text-lg"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Animation Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            <GlucoseAnimation />
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-[#006c67] text-center mb-16">Why Choose DirectDose?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-[#006c67] to-[#09fbb7] rounded-full flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-[#006c67] mb-4">High School Innovation</h3>
                <p className="text-gray-600 leading-relaxed">
                  Created by high school students to solve real-world problems for diabetics.
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-[#006c67] to-[#09fbb7] rounded-full flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-[#006c67] mb-4">Simple to Use</h3>
                <p className="text-gray-600 leading-relaxed">
                  Our intuitive interface makes calculating insulin doses quick and easy.
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-[#006c67] to-[#09fbb7] rounded-full flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-[#006c67] mb-4">Affordable</h3>
                <p className="text-gray-600 leading-relaxed">
                  Free to use, making diabetes management accessible to everyone.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Educational Content Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-[#006c67] text-center mb-8">Understanding Diabetes Management</h2>

            <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg text-center">
              <p className="text-amber-800 text-sm">
                <strong>Disclaimer:</strong> All information provided is based on medical research and educational
                resources, but should not be taken as medical advice. Always consult with your healthcare provider for
                personalized medical guidance and treatment decisions.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
                <h3 className="text-2xl font-bold text-[#006c67] mb-4">ICR (Insulin-to-Carbohydrate Ratio)</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  The ICR is the amount of insulin you need for every certain amount of carbohydrates you eat. It helps
                  you figure out how much insulin to take with your meals.
                </p>
                <p className="text-gray-600 leading-relaxed mb-4">
                  <strong>Bolus Insulin:</strong> This is the extra insulin you take to cover the carbohydrates in your
                  meal. It's taken at the time of eating.
                </p>
                <p className="text-gray-600 leading-relaxed mb-4">
                  <strong>Basal Insulin:</strong> This is your background insulin that you take to keep your blood sugar
                  level steady throughout the day and night, even when you're not eating.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  To calculate ICR over a few days, you can look at your blood sugar patterns after meals. If you eat a
                  certain amount of carbs and give a certain amount of insulin, how much did your blood sugar go down?
                  Over time, by tracking this, you can find your personal ICR for different meals.
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
                <h3 className="text-2xl font-bold text-[#006c67] mb-4">ISF (Insulin Sensitivity Factor)</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  The ISF tells you how much 1 unit of insulin lowers your blood sugar. It's used when your blood sugar
                  is high, and you need to correct it by taking extra insulin.
                </p>
                <p className="text-gray-600 leading-relaxed mb-4">
                  For example, if your ISF is 50, that means 1 unit of insulin will lower your blood sugar by 50 mg/dL.
                </p>
                <p className="text-gray-600 leading-relaxed mb-4">
                  ISF is important because it helps you adjust your insulin when your blood sugar is above your target
                  range. The higher the ISF number, the more your blood sugar will drop for each unit of insulin you
                  take.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  You can calculate ISF by testing how much your blood sugar drops after taking a specific amount of
                  insulin. For example, if you take 1 unit of insulin and your blood sugar drops by 40 mg/dL, that would
                  be your ISF for that time.
                </p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 mb-8">
              <h3 className="text-2xl font-bold text-[#006c67] mb-4">Key Terms</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    <strong>Carbs:</strong> This refers to the amount of carbohydrates in the food you're eating, which
                    will raise your blood sugar. Foods like bread, pasta, fruit, and sugar are high in carbs.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    <strong>Premeal Insulin:</strong> This is the bolus insulin you take before eating to cover the
                    carbs in your meal.
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 leading-relaxed">
                    Both ICR and ISF are key for managing diabetes and keeping blood sugar levels stable.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
              <h3 className="text-3xl font-bold text-[#006c67] mb-6">How Diabetes Works in the Body</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Diabetes affects how the body processes sugar (glucose), which is the main energy source for cells. The
                key player in controlling blood sugar is insulin, a hormone made by the pancreas. Insulin helps glucose
                enter cells from the bloodstream. If there's too little insulin or the body can't use it properly, blood
                sugar levels rise, leading to diabetes.
              </p>

              <div className="space-y-6">
                <div>
                  <h4 className="text-xl font-bold text-[#006c67] mb-3">1. Prediabetes: The Warning Sign</h4>
                  <p className="text-gray-600 leading-relaxed mb-2">
                    <strong>What happens?</strong> Blood sugar levels are higher than normal but not high enough to be
                    called diabetes.
                  </p>
                  <p className="text-gray-600 leading-relaxed mb-2">
                    <strong>Why?</strong> The body starts becoming resistant to insulin or the pancreas isn't making
                    enough insulin.
                  </p>
                  <p className="text-gray-600 leading-relaxed mb-2">
                    <strong>Effect:</strong> If not managed, prediabetes can turn into Type 2 diabetes.
                  </p>
                  <p className="text-gray-600 leading-relaxed italic">
                    Think of it like a traffic jam—glucose tries to get into cells, but insulin isn't working as well,
                    so sugar gets stuck in the bloodstream.
                  </p>
                </div>

                <div>
                  <h4 className="text-xl font-bold text-[#006c67] mb-3">2. Type 1 Diabetes: The Body Attacks Itself</h4>
                  <p className="text-gray-600 leading-relaxed mb-2">
                    <strong>What happens?</strong> The immune system mistakenly destroys insulin-producing cells in the
                    pancreas.
                  </p>
                  <p className="text-gray-600 leading-relaxed mb-2">
                    <strong>Why?</strong> This is an autoimmune disease—your body attacks itself for unknown reasons.
                  </p>
                  <p className="text-gray-600 leading-relaxed mb-2">
                    <strong>Effect:</strong> The pancreas stops making insulin completely, so glucose builds up in the
                    blood instead of going into cells.
                  </p>
                  <p className="text-gray-600 leading-relaxed mb-2">
                    People with Type 1 diabetes must take insulin because their body makes none at all.
                  </p>
                  <p className="text-gray-600 leading-relaxed italic">
                    Imagine a broken key—insulin is like the key that unlocks the door for glucose to enter cells. In
                    Type 1, the key is missing, so the sugar stays in the blood.
                  </p>
                </div>

                <div>
                  <h4 className="text-xl font-bold text-[#006c67] mb-3">3. Type 2 Diabetes: Insulin Resistance</h4>
                  <p className="text-gray-600 leading-relaxed mb-2">
                    <strong>What happens?</strong> The body still makes insulin, but cells stop responding to it.
                  </p>
                  <p className="text-gray-600 leading-relaxed mb-2">
                    <strong>Why?</strong> Over time, lifestyle factors (like diet, lack of exercise, and genetics) can
                    make cells resistant to insulin. The pancreas tries to make more insulin but eventually wears out.
                  </p>
                  <p className="text-gray-600 leading-relaxed mb-2">
                    <strong>Effect:</strong> Blood sugar stays too high, leading to complications over time.
                  </p>
                  <p className="text-gray-600 leading-relaxed mb-2">
                    Managed with diet, exercise, medication, and sometimes insulin if the pancreas gets too weak.
                  </p>
                  <p className="text-gray-600 leading-relaxed italic">
                    Think of it like a broken lock—the key (insulin) is there, but the lock (cells) won't open properly,
                    so glucose gets stuck outside.
                  </p>
                </div>

                <div>
                  <h4 className="text-xl font-bold text-[#006c67] mb-3">
                    4. Gestational Diabetes: Pregnancy-Related Diabetes
                  </h4>
                  <p className="text-gray-600 leading-relaxed mb-2">
                    <strong>What happens?</strong> Pregnancy hormones make the body more resistant to insulin.
                  </p>
                  <p className="text-gray-600 leading-relaxed mb-2">
                    <strong>Why?</strong> The placenta releases hormones that help the baby grow but also block
                    insulin's effect. If the pancreas can't make extra insulin to compensate, blood sugar rises.
                  </p>
                  <p className="text-gray-600 leading-relaxed mb-2">
                    <strong>Effect:</strong> Usually disappears after pregnancy, but increases the risk of Type 2
                    diabetes later.
                  </p>
                  <p className="text-gray-600 leading-relaxed mb-2">
                    Managed with diet, exercise, or insulin if needed.
                  </p>
                  <p className="text-gray-600 leading-relaxed italic">
                    Imagine a clogged filter—extra pregnancy hormones act like a blockage, making it harder for insulin
                    to do its job.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-white/20">
              <h2 className="text-4xl font-bold text-[#006c67] mb-6">Ready to Take Control?</h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Start calculating your insulin doses with confidence today. It's free, fast, and designed with your
                health in mind.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/calculator"
                  className="px-8 py-4 bg-[#006c67] text-white rounded-full hover:bg-[#09fbb7] hover:text-[#006c67] transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Try Calculator Now
                </Link>
                <Link
                  href="/about"
                  className="px-8 py-4 border-2 border-[#006c67] text-[#006c67] rounded-full hover:bg-[#006c67] hover:text-white transition-all duration-300 font-semibold text-lg"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-12 border-t border-gray-200/50">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-6">
              <Link href="/support" className="text-[#006c67] hover:text-[#09fbb7] transition-colors font-medium">
                Support
              </Link>
              <span className="hidden sm:block text-gray-400">•</span>
              <Link
                href="/privacy-policy"
                className="text-[#006c67] hover:text-[#09fbb7] transition-colors font-medium"
              >
                Privacy Policy
              </Link>
              <span className="hidden sm:block text-gray-400">•</span>
              <Link href="/faq" className="text-[#006c67] hover:text-[#09fbb7] transition-colors font-medium">
                FAQ
              </Link>
            </div>
            <p className="text-gray-500 text-sm">© 2025 DirectDose. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
