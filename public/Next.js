"use client"

import React from "react"

export default function FoodMoodPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start py-16 px-4">
      {/* Page Title */}
      <h1 className="text-4xl font-bold mb-8">FoodMood</h1>

      {/* iframe for FoodMood project */}
      <div className="w-full max-w-5xl h-[800px] border shadow-md rounded-lg overflow-hidden">
        <iframe
          src="/FoodMood-main/frontend/index.html"
          className="w-full h-full"
          frameBorder="0"
          title="FoodMood App"
        ></iframe>
      </div>

      <p className="mt-6 text-gray-600 text-center">
        Your FoodMood project is embedded above. All interactions are fully functional.
      </p>
    </div>
  )
}
