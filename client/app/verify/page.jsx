"use client"
import axios from "axios";
import { useContext, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Context } from "../../context/Context";

export default function Verify() {
    const { url, token } = useContext(Context);
    const router = useRouter();
    const searchParams = useSearchParams();

    const success = searchParams.get("success");
    const orderId = searchParams.get("orderId");

    useEffect(() => {
        const verifyPayment = async () => {
            if (!token || !orderId) return;
            try {
                const res = await axios.post(
                    url + "/api/order/verify-stripe",
                    { orderId, success },
                    { headers: { token } }
                );
                router.push(res.data.success ? "/orders" : "/cart");
            } catch (err) {
                console.error("verifyStripe request failed:", err);
                router.push("/cart");
            }
        };
        verifyPayment();
    }, [token, orderId, success]);

    return (
        <div className="flex items-center justify-center h-screen text-sm text-gray-500">
            Verifying your payment…
        </div>
    );
}