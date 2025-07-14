"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { GlucoseAnimation } from "@/components/glucose-animation"
import { createClient } from "@/utils/supabase/client"
import { Dialog } from "@headlessui/react"

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

const roles = [
  { title: "Outreach Team", description: "Help us connect with hospitals, schools, and nonprofits." },
  { title: "Design & UX", description: "Create engaging interfaces and user flows for diabetics." },
  { title: "Medical Research", description: "Assist in ensuring our features align with current diabetes treatment guidelines." },
  { title: "Marketing", description: "Spread the word about DirectDose across social media and beyond." },
  { title: "Software Development", description: "Help improve app performance and add new features." }
]

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [username, setUsername] = useState<string>("")
  const [greeting, setGreeting] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          setUser(user)

          const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).single()

          if (profile?.username) {
            setUsername(profile.username)
          } else {
            setUsername(user.email?.split("@")[0] || "Friend")
          }

          const randomGreeting = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)]
          setGreeting(randomGreeting)
        }
      } catch (error) {
        console.error("Error checking auth:", error)
      }
    }

    checkAuth()
  }, [supabase])

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    )
  }

  const handleSubmit = async () => {
    const body = `Name: ${fullName}\nEmail: ${email}\nRoles: ${selectedRoles.join(", ")}\nMessage: ${message}`
    await fetch("https://formsubmit.co/ajax/Pratyay015@gmail.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name: fullName,
        email: email,
        message: body,
      }),
    })
    setSubmitted(true)
    setTimeout(() => {
      setIsModalOpen(false)
      setSubmitted(false)
      setFullName("")
      setEmail("")
      setSelectedRoles([])
      setMessage("")
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-teal-200/30 to-emerald-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-200/30 to-teal-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-teal-100/20 to-emerald-100/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-[#e6fff9]">
          <div className="max-w-4xl mx-auto text-center">
            {user && (
              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-semibold text-[#006c67] mb-2">
                  Hi {username}! {greeting}
                </h2>
              </div>
            )}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-black">Welcome to </span>
              <span className="text-[#006c67]">DirectDose</span>
            </h1>
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
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-8 py-4 bg-white border-2 border-[#006c67] text-[#006c67] rounded-full hover:bg-[#006c67] hover:text-white transition-all duration-300 font-semibold text-lg"
              >
                Join Us
              </button>
            </div>
          </div>
        </section>

        <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white max-w-lg w-full rounded-2xl p-6 shadow-xl">
              <Dialog.Title className="text-2xl font-bold mb-4 text-[#006c67]">Join the DirectDose Team</Dialog.Title>
              {!submitted ? (
                <>
                  <div className="space-y-4">
                    {roles.map((role) => (
                      <div key={role.title}>
                        <label className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            className="mt-1"
                            checked={selectedRoles.includes(role.title)}
                            onChange={() => toggleRole(role.title)}
                          />
                          <div>
                            <span className="font-semibold text-[#006c67]">{role.title}</span>
                            <p className="text-sm text-gray-600">{role.description}</p>
                          </div>
                        </label>
                      </div>
                    ))}
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full p-2 border rounded-lg"
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-2 border rounded-lg"
                    />
                    {selectedRoles.length > 0 && (
                      <textarea
                        placeholder="Why do you want to join?"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full p-2 border rounded-lg"
                        rows={4}
                      />
                    )}
                  </div>
                  <div className="mt-6 flex justify-between">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="px-6 py-2 bg-[#006c67] text-white rounded-lg hover:bg-[#09fbb7] hover:text-[#006c67]"
                    >
                      Submit
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-green-600 font-medium text-center">Submission received! Thank you.</p>
              )}
            </Dialog.Panel>
          </div>
        </Dialog>

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