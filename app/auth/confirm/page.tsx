"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function ConfirmPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token_hash");
  const type = searchParams.get("type");

  if (!token || type !== "email_confirm") {
    return <div>Invalid or missing token.</div>;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div>
        <h1>Email Confirmation</h1>
        <p>Your email has been confirmed! You can now log in.</p>
      </div>
    </Suspense>
  );
}
