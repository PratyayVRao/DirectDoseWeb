import Link from "next/link"

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-teal-200/30 to-emerald-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-200/30 to-teal-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-teal-100/20 to-emerald-100/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#006c67] mb-4">DirectDose Support</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Welcome to the DirectDose Support page. If you need help using the app, troubleshooting features, or
            understanding how insulin dosing works within DirectDose, you're in the right place.
          </p>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-[#006c67] mb-8 text-center">Frequently Asked Questions</h2>

          <div className="space-y-6">
            {/* FAQ Item 1 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <h3 className="text-xl font-semibold text-[#006c67] mb-3">1. What does DirectDose do?</h3>
              <p className="text-gray-700">
                DirectDose helps users calculate prandial (mealtime) insulin doses based on carbohydrate intake, ICR
                (Insulin-to-Carbohydrate Ratio), and correction factors. It also allows you to save and reuse meals.
              </p>
            </div>

            {/* FAQ Item 2 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <h3 className="text-xl font-semibold text-[#006c67] mb-3">2. Does DirectDose work offline?</h3>
              <p className="text-gray-700">
                Yes, most features work offline. However, the food analysis (carb estimation) relies on the Edamam API
                and requires an internet connection.
              </p>
            </div>

            {/* FAQ Item 3 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <h3 className="text-xl font-semibold text-[#006c67] mb-3">3. Why is my insulin dose wrong?</h3>
              <p className="text-gray-700">
                Please double-check that your ICR and correction factor are accurate. If you're unsure, consult with
                your healthcare provider. Also make sure meal descriptions are clear and specific (e.g., "2 slices of
                whole wheat bread" instead of just "bread").
              </p>
            </div>

            {/* FAQ Item 4 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <h3 className="text-xl font-semibold text-[#006c67] mb-3">4. Is my data private?</h3>
              <p className="text-gray-700">
                Yes. We do not collect personally identifiable information. All entries are stored locally on your
                device. Please read our{" "}
                <Link href="/privacy-policy" className="text-[#006c67] hover:text-[#09fbb7] underline">
                  Privacy Policy
                </Link>{" "}
                for full details.
              </p>
            </div>

            {/* FAQ Item 5 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <h3 className="text-xl font-semibold text-[#006c67] mb-3">
                5. How do I report a bug or request a feature?
              </h3>
              <p className="text-gray-700">
                Please email us at{" "}
                <a href="mailto:pratyay@direct-dose.com" className="text-[#006c67] hover:text-[#09fbb7] underline">
                  pratyay@direct-dose.com
                </a>
                . Include your device model, iOS version, and a description of the issue.
              </p>
            </div>

            {/* FAQ Item 6 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <h3 className="text-xl font-semibold text-[#006c67] mb-3">6. Will DirectDose sync between devices?</h3>
              <p className="text-gray-700">
                This feature is not currently supported, but we plan to add account-based syncing in future updates.
              </p>
            </div>

            {/* FAQ Item 7 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <h3 className="text-xl font-semibold text-[#006c67] mb-3">
                7. Is DirectDose a replacement for medical advice?
              </h3>
              <p className="text-gray-700">
                No. DirectDose is an assistive tool. Always follow your doctor's guidance when managing diabetes.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
            <h2 className="text-3xl font-bold text-[#006c67] mb-4">Contact Us</h2>
            <p className="text-lg text-gray-700 mb-6">Still have questions?</p>
            <div className="space-y-2">
              <p className="text-gray-700">
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:pratyay@direct-dose.com"
                  className="text-[#006c67] hover:text-[#09fbb7] underline transition-colors"
                >
                  pratyay@direct-dose.com
                </a>
              </p>
              <p className="text-sm text-gray-600">We aim to respond within 1–2 business days.</p>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-[#006c67] text-white rounded-full hover:bg-[#09fbb7] hover:text-[#006c67] transition-all duration-300 font-semibold"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
