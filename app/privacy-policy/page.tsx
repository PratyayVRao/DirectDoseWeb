import Link from "next/link"

export default function PrivacyPolicyPage() {
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
          <h1 className="text-4xl md:text-5xl font-bold text-[#006c67] mb-4">Privacy Policy for DirectDose</h1>
          <p className="text-lg text-gray-600">Effective Date: July 5, 2025</p>
        </div>

        {/* Introduction */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <p className="text-gray-700 leading-relaxed">
              DirectDose ("we," "us," or "our") is committed to protecting the privacy and security of users who access
              and use our application ("the App"). This Privacy Policy explains how we collect, use, disclose, and
              safeguard your information when you use DirectDose.
            </p>
          </div>
        </div>

        {/* Policy Sections */}
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Section 1 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <h2 className="text-2xl font-bold text-[#006c67] mb-4">1. Information We Collect</h2>
            <div className="text-gray-700 space-y-3">
              <p>We collect information you voluntarily provide when using the App. This may include:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Meal and food item descriptions</li>
                <li>Estimated carbohydrate intake</li>
                <li>Insulin-to-carbohydrate ratio (ICR) and insulin dosage</li>
                <li>Blood sugar values (if entered)</li>
              </ul>
              <p>Additionally, we may automatically collect limited technical information, including:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Device type and operating system</li>
                <li>Anonymous crash and performance reports</li>
                <li>Usage patterns and app interaction (for improvement purposes)</li>
              </ul>
              <p>
                We do not collect or request personal identifiers such as your name, email, address, or location unless
                you contact us directly for support.
              </p>
            </div>
          </div>

          {/* Section 2 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <h2 className="text-2xl font-bold text-[#006c67] mb-4">2. How We Use Your Information</h2>
            <div className="text-gray-700 space-y-3">
              <p>
                The information you provide is used solely to deliver and improve the App's functionality. Specifically,
                we may use the information to:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Calculate insulin doses based on your input</li>
                <li>Store and retrieve your saved meals or insulin preferences</li>
                <li>Analyze anonymized usage trends to improve app performance</li>
              </ul>
              <p>
                We may sell anonymized data based on generics of your meal information and usage of the app. All sold
                data will follow HIPAA guidance.
              </p>
            </div>
          </div>

          {/* Section 3 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <h2 className="text-2xl font-bold text-[#006c67] mb-4">3. Data Storage and Security</h2>
            <div className="text-gray-700 space-y-3">
              <p>
                All data is stored securely using iOS's local storage mechanisms. If cloud-based storage or account
                features are added in the future (e.g., Supabase integration), data will be encrypted in transit and at
                rest.
              </p>
              <p>
                We implement appropriate technical and administrative safeguards to protect your information, but no
                method of transmission or storage is 100% secure.
              </p>
            </div>
          </div>

          {/* Section 4 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <h2 className="text-2xl font-bold text-[#006c67] mb-4">4. Third-Party Services</h2>
            <div className="text-gray-700 space-y-3">
              <p>
                DirectDose currently uses the Edamam API for nutritional analysis. When you enter food information,
                anonymized requests are sent to Edamam to retrieve nutritional content. Edamam may collect limited
                metadata such as timestamp and food query text. Edamam's privacy practices are governed by their own
                policies.
              </p>
              <p>No third-party tracking or analytics tools are used in this version of the App.</p>
            </div>
          </div>

          {/* Section 5 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <h2 className="text-2xl font-bold text-[#006c67] mb-4">5. Children's Privacy</h2>
            <div className="text-gray-700 space-y-3">
              <p>
                DirectDose is not intended for use by individuals under the age of 13. We do not knowingly collect
                information from children. If we learn that we have inadvertently collected such data, we will take
                prompt steps to delete it.
              </p>
            </div>
          </div>

          {/* Section 6 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <h2 className="text-2xl font-bold text-[#006c67] mb-4">6. Changes to This Policy</h2>
            <div className="text-gray-700 space-y-3">
              <p>
                We reserve the right to update this policy at any time. Any changes will be reflected on this page and,
                if significant, communicated within the app.
              </p>
            </div>
          </div>

          {/* Section 7 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <h2 className="text-2xl font-bold text-[#006c67] mb-4">7. Contact Us</h2>
            <div className="text-gray-700 space-y-3">
              <p>For any questions about this policy or your data, you may contact us at:</p>
              <p>
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:pratyay@direct-dose.com"
                  className="text-[#006c67] hover:text-[#09fbb7] underline transition-colors"
                >
                  Pratyay@direct-dose.com
                </a>
              </p>
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
