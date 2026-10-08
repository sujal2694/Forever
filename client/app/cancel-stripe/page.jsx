"use client";

import { Suspense, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { Context } from "../context/Context";

function CancelStripeContent() {
  const searchParams = useSearchParams();
  const { url, token } = useContext(Context);
  const [message, setMessage] = useState("Cancelling your payment session...");
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (!sessionId) return;

    axios.get(`${url}/api/order/cancel-stripe`, {
      params: { session_id: sessionId },
      headers: { token },
    }).then(() => {
      setMessage("Payment cancelled. Your items remain in your cart.");
    }).catch((error) => {
      console.error("Stripe cancellation failed:", error);
      setMessage(error.response?.data?.message || "Unable to cancel the payment session right now.");
    });
  }, [searchParams, sessionId, token, url]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <section className="w-full max-w-md bg-white p-8 text-center shadow-sm">
        <h1 className="mb-3 text-2xl font-semibold">Payment cancelled</h1>
        <p className="mb-6 text-gray-600" role="status" aria-live="polite">
          {sessionId ? message : "The payment session could not be found."}
        </p>
        <Link className="inline-flex min-h-11 items-center justify-center bg-black px-5 text-sm font-medium text-white" href="/cart">
          Return to cart
        </Link>
      </section>
    </main>
  );
}

export default function CancelStripePage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center">Loading payment status...</main>}>
      <CancelStripeContent />
    </Suspense>
  );
}