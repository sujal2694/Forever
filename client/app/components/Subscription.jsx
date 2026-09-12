import axios from "axios";
import { useContext, useState } from "react";
import { Context } from "../context/Context";

const Subscripation = () => {

    const [subscriptionEmail, setSubscriptionEmail] = useState("");
    const [status, setStatus] = useState("idle");
    const [message, setMessage] = useState("");
    const { url } = useContext(Context);

    const handleSubscription = async (event) => {
        event.preventDefault();

        const email = subscriptionEmail.trim();
        if (!email) {
            setStatus("error");
            setMessage("Please enter your email address.");
            return;
        }

        setStatus("loading");
        setMessage("");

        try {
            const response = await axios.post(`${url}/api/subscription/placesubscription`, { email });

            if (!response.data?.success) {
                throw new Error(response.data?.message || "Unable to subscribe right now.");
            }

            setSubscriptionEmail("");
            setStatus("success");
            setMessage("You are subscribed. Your 20% welcome offer is on its way.");
        } catch (error) {
            console.error("Error subscribing:", error);
            setStatus("error");
            setMessage(error.response?.data?.message || error.message || "Unable to subscribe right now. Please try again.");
        }
    };

    return (
        <section className="w-full px-3 my-28 fade-in" aria-labelledby="subscription-title">
            <div className="relative isolate overflow-hidden px-5 py-12 sm:px-10 lg:px-16">
                <div className="absolute -right-20 -top-24 -z-10 h-64 w-64 rounded-full opacity-70 blur-3xl" aria-hidden="true" />
                <div className="absolute -bottom-32 -left-20 -z-10 h-64 w-64 rounded-full opacity-80 blur-3xl" aria-hidden="true" />
                <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
                    <p className="mb-3 text-xs font-medium uppercase tracking-[0.28em] text-gray-500">The Forever edit</p>
                    <h2 id="subscription-title" className="mb-3 text-2xl font-semibold sm:text-3xl">Subscribe now and get 20% off</h2>
                    <p className="mb-7 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">Get first access to new arrivals, thoughtful style notes, and an exclusive welcome offer.</p>
                    <form className="flex w-full max-w-xl flex-col gap-3 sm:flex-row" onSubmit={handleSubscription} noValidate>
                        <input
                            className="h-12 min-w-0 flex-1 border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10 disabled:cursor-not-allowed disabled:bg-gray-100"
                            type="email"
                            name="email"
                            autoComplete="email"
                            aria-label="Email address"
                            aria-describedby="subscription-message subscription-privacy"
                            aria-invalid={status === "error"}
                            placeholder="Enter your email"
                            value={subscriptionEmail}
                            onChange={(e) => setSubscriptionEmail(e.target.value)}
                            disabled={status === "loading"}
                            required
                        />
                        <button
                            className="h-12 shrink-0 bg-black px-8 text-xs font-medium uppercase tracking-wider text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60 sm:px-10"
                            type="submit"
                            disabled={status === "loading"}
                        >
                            {status === "loading" ? "Joining..." : "Subscribe"}
                        </button>
                    </form>
                    <p id="subscription-message" role="status" aria-live="polite" className={`mt-4 min-h-5 text-sm ${status === "success" ? "text-green-700" : status === "error" ? "text-red-600" : "text-gray-500"}`}>
                        {message}
                    </p>
                    <p id="subscription-privacy" className="mt-2 text-xs text-gray-400">No spam. Unsubscribe anytime.</p>
                </div>
            </div>
        </section>
    )
}

export default Subscripation
