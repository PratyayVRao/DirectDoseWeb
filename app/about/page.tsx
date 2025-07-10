"use client"

import { useIntersectionObserver } from "@/hooks/use-intersection-observer"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
  const [headerRef, headerVisible] = useIntersectionObserver<HTMLHeadingElement>({ once: true })
  const [contentRef, contentVisible] = useIntersectionObserver<HTMLDivElement>({ once: true, threshold: 0.1 })
  const [founderRef, founderVisible] = useIntersectionObserver<HTMLDivElement>({ once: true, threshold: 0.1 })

  return (
    <div className="container mx-auto py-10 px-4 relative">
      {/* Animated decorative elements */}
      <div className="absolute top-20 left-0 w-24 h-24 rounded-full bg-[#09fbb7]/10 animate-float-slow hidden lg:block"></div>
      <div className="absolute top-40 right-0 w-16 h-16 rounded-full bg-[#006c67]/10 animate-float-medium hidden lg:block"></div>
      <div className="absolute bottom-40 left-10 w-20 h-20 rounded-full bg-[#006c67]/10 animate-float-fast hidden lg:block"></div>
      <div className="absolute bottom-20 right-10 w-12 h-12 rounded-full bg-[#09fbb7]/10 animate-float-medium hidden lg:block"></div>

      <h1
        ref={headerRef}
        className={`text-4xl font-bold mb-8 text-center text-[#006c67] transition-all duration-1000 ${
          headerVisible ? "opacity-100 transform translate-y-0" : "opacity-0 transform -translate-y-10"
        }`}
      >
        About DirectDose
      </h1>

      <div
        ref={contentRef}
        className={`max-w-4xl mx-auto mb-16 transition-all duration-1000 ${
          contentVisible ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-10"
        }`}
      >
        <h2 className="text-2xl font-bold mb-4 text-[#006c67]">
          DirectDose: Making Insulin Management Simple, Accurate, and Accessible
        </h2>

        <h3 className="text-xl font-semibold mt-8 mb-3 text-[#006c67]">The Problem</h3>
        <p className="mb-4 text-[#006c67]">
          Managing diabetes can be overwhelming, especially without expensive continuous glucose monitors (CGMs). Over
          50% of diabetics lack access to these costly tools, leaving them with confusing, ineffective alternatives.
        </p>
        <p className="mb-6 text-[#006c67]">
          Last year, my grandfather nearly lost his life to diabetic ketoacidosis—a preventable condition. When we asked
          his doctors why his management had failed, they had no clear answer. We realized that millions of people face
          the same uncertainty every day. That's why we created DirectDose.
        </p>

        <h3 className="text-xl font-semibold mt-8 mb-3 text-[#006c67]">Our Solution: DirectDose</h3>
        <p className="mb-4 text-[#006c67]">
          DirectDose is a free, easy-to-use website and app that simplifies insulin dosing, removing confusion and cost barriers.
        </p>
        <ul className="list-disc pl-6 mb-6 space-y-2 text-[#006c67]">
          <li>
            <strong>Simplified insulin calculations</strong> – Our app determines Insulin-to-Carb (IC) ratios and insulin
            needs based on food inputs, reducing the need for manual math.
          </li>
          <li>
            <strong>Built for accessibility</strong> – Designed for older adults and underserved communities, DirectDose
            ensures that managing diabetes is simple and stress-free.
          </li>
          <li>
            <strong>No subscriptions or expensive devices</strong> – DirectDose is completely free so that everyone can
            get the support they need.
          </li>
        </ul>

        <h3 className="text-xl font-semibold mt-8 mb-3 text-[#006c67]">What Makes DirectDose Different?</h3>
        <p className="mb-4 text-[#006c67]">
          Most diabetes management tools are either too expensive, too complex, or not built specifically for insulin
          users. DirectDose changes that.
        </p>
        <ul className="list-disc pl-6 mb-6 space-y-2 text-[#006c67]">
          <li>
            <strong>Designed for Real People</strong> – A simple, user-friendly interface with no overwhelming data.
          </li>
          <li>
            <strong>Guaranteed Simplicity & Accuracy</strong> – Ensures confidence in insulin management.
          </li>
          <li>
            <strong>Reliable & Up-to-Date</strong> – Our development team continuously improves the app for a seamless
            experience.
          </li>
        </ul>

        <h3 className="text-xl font-semibold mt-8 mb-3 text-[#006c67]">Proven Demand & Growing Community</h3>
        <p className="mb-4 text-[#006c67]">Even before launch, DirectDose is already making an impact:</p>
        <ul className="list-disc pl-6 mb-6 space-y-2 text-[#006c67]">
          <li>
            <strong>Proven Demand:</strong> thousands of beta inquiries and hundreds of positive testimonials from early
            users show strong demand.
          </li>
          <li>
            <strong>Fast, Reliable Updates</strong> – Our streamlined production process ensures ongoing improvements.
          </li>
          <li>
            <strong>Expanding Reach</strong> – Users can sign up through our testing website to stay
            updated.
          </li>
        </ul>

        <h3 className="text-xl font-semibold mt-8 mb-3 text-[#006c67]">Beyond Individual Users: The Power of Data</h3>
        <p className="mb-4 text-[#006c67]">
          DirectDose doesn't just help individual diabetics—it provides data-driven insights to improve diabetes care:
        </p>
        <ul className="list-disc pl-6 mb-6 space-y-2 text-[#006c67]">
          <li>Insurance companies gain anonymized data to enhance diabetes coverage.</li>
          <li>Research institutions benefit from real-world insights to drive innovation.</li>
          <li>Healthcare providers can better understand patient insulin management outside clinical settings.</li>
        </ul>

        <h3 className="text-xl font-semibold mt-8 mb-3 text-[#006c67]">Coming Soon</h3>
        <p className="mb-6 text-[#006c67]">
          Our app is still in development, but keep your eyes out for it in the App Store! It's coming soon. Sign up to
          be the first to know when we launch.
        </p>

        <div className="text-center mt-8">
          <p className="text-lg font-medium text-[#006c67] mb-4">
            Join the movement to make diabetes care simple, affordable, and life-saving.
          </p>
          <Button className="bg-[#006c67] hover:bg-[#004a46] text-white">
            <Link href="/login">Sign Up Now</Link>
          </Button>
        </div>
      </div>

      <div
        ref={founderRef}
        className={`max-w-4xl mx-auto border-t-2 border-[#006c67]/20 pt-12 transition-all duration-1000 ${
          founderVisible ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-10"
        }`}
      >
        <h2 className="text-2xl font-bold mb-8 text-center text-[#006c67]">Our Founder</h2>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="w-48 h-48 relative rounded-full overflow-hidden border-4 border-[#006c67] flex-shrink-0">
            <Image src="/images/pratyay-portrait.png" alt="Pratyay Rao" fill className="object-cover" />
          </div>

          <div>
            <h3 className="text-xl font-bold mb-3 text-[#006c67]">Pratyay Rao</h3>
            <h4 className="text-lg font-medium mb-4 text-[#006c67]">CEO and Founder</h4>
            <p className="text-[#006c67] mb-4">
              Pratyay Rao, a young entrepreneur from Winnetka, Illinois, is a sophomore at New Trier High School and an
              active member of his community. His passion for medicine and entrepreneurship has lead to incredible impact through DirectDose. DirectDose has won multiple pitch competitions, including the Illinois Wesleyan InnoVators Pitch Competition, earning thousands of dollars in awards.
            </p>
            <p className="text-[#006c67] mb-4">
              Pratyay has raised over $10,000 for cancer research, combining his talents in piano and business to
              support the cause. In addition, he has volunteered with the Breast Cancer Hub, leading students in
              organizing fundraisers and sales.
            </p>
            <p className="text-[#006c67]">
              Pratyay integrates his expertise in medicine and computer science from Science Olympiad, business acumen
              from DECA, and musical proficiency in piano to maximize his impact across all his endeavors.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
