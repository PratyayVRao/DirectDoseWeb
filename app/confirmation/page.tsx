"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ConfirmationPage() {
  const router = useRouter()

  const handleReturnHome = () => {
    router.push("/")
  }

  return (
    <div className="container mx-auto py-20 px-4">
      <div className="max-w-md mx-auto">
        <Card className="border-2 border-[#006c67] text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-[#006c67]">Confirmation Successful!</CardTitle>
            <CardDescription>Your email has been confirmed and your account is now active.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-[#006c67] mb-6">
              Welcome to DirectDose! You can now access all features of the platform.
            </p>
            <Button onClick={handleReturnHome} className="w-full bg-[#006c67] hover:bg-[#004a46] text-white">
              Return to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
