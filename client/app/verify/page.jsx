"use client";

import { Suspense, useEffect, useState, useContext } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { Context } from "../context/Context";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { url, token } = useContext(Context);
  const [status, setStatus] = useState("Verifying payment...");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      setStatus("Payment session is missing.");
      return;
    }

    const verify = async () => {
      try {
        const response = await axios.get(`${url}/api/order/verify-stripe`, {
          params: { session_id: sessionId },
          headers: { token },
        });

        if (response.data.success) {
          setStatus("Payment verified successfully. Redirecting to your orders...");
          setTimeout(() => router.push("/profile"), 1500);
        } else {
          setStatus(response.data.message || "Payment verification failed.");
        }
      } catch (error) {
        console.error("Stripe verification failed", error);
        setStatus("Unable to verify payment right now.");
      }
    };

    verify();
  }, [searchParams, router, url, token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md w-full">
        <h1 className="text-2xl font-semibold mb-3">Stripe Payment</h1>
        <p className="text-gray-600">{status}</p>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md w-full">
            <h1 className="text-2xl font-semibold mb-3">Stripe Payment</h1>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}