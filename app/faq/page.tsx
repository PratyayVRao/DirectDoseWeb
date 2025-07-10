import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function FAQ() {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-[#006c67]">Frequently Asked Questions</h1>

      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="border-2 border-[#006c67]">
          <CardHeader>
            <CardTitle className="text-[#006c67]">What is DirectDose?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#006c67]">
              DirectDose is a free insulin dosage calculator designed to help people with diabetes calculate their
              insulin doses for meals. It uses the Edamam API to analyze food and calculate carbohydrates, then
              determines the appropriate insulin dose based on your insulin-to-carb ratio.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-[#006c67]">
          <CardHeader>
            <CardTitle className="text-[#006c67]">Is DirectDose medical advice?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#006c67]">
              No, DirectDose is not medical advice. It is a tool meant to assist with insulin calculations, but you
              should always consult with your healthcare provider before making any changes to your insulin regimen.
              DirectDose is designed as a minimum viable product for those who cannot afford or access more expensive
              healthcare options.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-[#006c67]">
          <CardHeader>
            <CardTitle className="text-[#006c67]">How accurate are the calculations?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#006c67]">
              DirectDose is currently in beta testing, so some values may be inaccurate. The calculations are based on
              nutritional data from the Edamam API and standard insulin calculation formulas. Always monitor your blood
              sugar levels and consult with a healthcare provider if you experience concerning highs or lows.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-[#006c67]">
          <CardHeader>
            <CardTitle className="text-[#006c67]">What is an insulin-to-carb ratio (ICR)?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#006c67]">
              An insulin-to-carb ratio (ICR) tells you how many grams of carbohydrates one unit of insulin will cover.
              For example, if your ICR is 1:15, then 1 unit of insulin will cover 15 grams of carbohydrates. You can
              calculate your personalized ICR using our{" "}
              <Link href="/icr-calculator" className="underline hover:text-[#004a46]">
                ICR Calculator
              </Link>
              .
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-[#006c67]">
          <CardHeader>
            <CardTitle className="text-[#006c67]">Do I need to create an account?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#006c67]">
              No, you can use the basic calculator without an account. However, creating an account allows you to save
              your meals, track your history, and store your personalized insulin ratios for easier future calculations.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-[#006c67]">
          <CardHeader>
            <CardTitle className="text-[#006c67]">How do I enter food items?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#006c67]">
              Enter food items separated by commas with quantities. For example: "1 apple, 100g rice, 2 slices bread".
              Be as specific as possible with quantities and types of food for more accurate results.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-[#006c67]">
          <CardHeader>
            <CardTitle className="text-[#006c67]">What should I do if my blood sugar is too high or low?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#006c67]">
              If you experience dangerously high or low blood sugar levels, seek immediate medical attention. DirectDose
              is a tool to assist with calculations, but it cannot replace proper medical care and monitoring.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-[#006c67]">
          <CardHeader>
            <CardTitle className="text-[#006c67]">Is my data secure?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#006c67]">
              Yes, we take data security seriously. Your personal information and health data are stored securely and
              are not shared with third parties. See our{" "}
              <Link href="/privacy-policy" className="underline hover:text-[#004a46]">
                Privacy Policy
              </Link>{" "}
              for more details.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-[#006c67]">
          <CardHeader>
            <CardTitle className="text-[#006c67]">Can I use DirectDose on my phone?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#006c67]">
              Yes, DirectDose is designed to work on all devices including smartphones, tablets, and computers. The
              interface is responsive and adapts to your screen size.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-[#006c67]">
          <CardHeader>
            <CardTitle className="text-[#006c67]">How can I get support?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#006c67]">
              If you need help or have questions, you can visit our{" "}
              <Link href="/support" className="underline hover:text-[#004a46]">
                Support page
              </Link>{" "}
              or contact us directly. We're here to help you use DirectDose effectively and safely.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
