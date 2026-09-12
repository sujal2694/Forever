"use client"
import axios from "axios";
import { useContext, useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Context } from "../context/Context";
import Navbar from "../components/Navbar";
import Title from "../components/Title";
import SelectDeliveryAddress from "../components/SelectDeliveryAddress";
import { products } from "../assets/assets";
import Image from "next/image";

export default function PlaceOrder() {
    const { url, cartItems, setCartItems, productList, currency, token } = useContext(Context);
    const availableProducts = productList?.length ? productList : products;

    const router = useRouter();

    const [step, setStep] = useState("address");
    const [addressId, setAddressId] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [placing, setPlacing] = useState(false);
    const [error, setError] = useState("");
    const [subscriptionActive, setSubscriptionActive] = useState(false);

    useEffect(() => {
        if (!token) {
            // Clear a previous account's discount when the user logs out.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSubscriptionActive(false);
            return undefined;
        }

        const fetchSubscriptionStatus = async () => {
            try {
                const response = await axios.get(`${url}/api/subscription/status`, {
                    headers: { token },
                });
                setSubscriptionActive(response.data?.success && response.data.active === true);
            } catch (statusError) {
                console.error("Subscription status check failed:", statusError);
                setSubscriptionActive(false);
            }
        };

        fetchSubscriptionStatus();
    }, [token, url]);

    // cartItems is now nested: { [itemId]: { [size]: quantity } }
    const orderItems = useMemo(() => {
        const flat = [];
        for (const itemId in cartItems || {}) {
            const sizes = cartItems[itemId] || {};
            for (const size in sizes) {
                const quantity = sizes[size];
                if (quantity > 0) {
                    const itemInfo = availableProducts.find((p) => p._id === itemId);
                    if (itemInfo) {
                        const image = Array.isArray(itemInfo.image) ? itemInfo.image[0] : itemInfo.image;
                        flat.push({
                            product: itemInfo._id,
                            image,
                            name: itemInfo.name,
                            price: itemInfo.price,
                            displayPrice: (itemInfo.price * currency) / 20,
                            size,
                            quantity,
                            deliveryFee: quantity * (itemInfo.price * currency * 0.001),
                        });
                    }
                }
            }
        }
        return flat;
    }, [cartItems, availableProducts, currency]);

    const itemsTotal = useMemo(
        () => orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        [orderItems]
    );
    const displayItemsTotal = useMemo(
        () => orderItems.reduce((sum, item) => sum + item.displayPrice * item.quantity, 0),
        [orderItems]
    );
    const totalDeliveryFee = useMemo(
        () => orderItems.reduce((sum, item) => sum + item.deliveryFee, 0),
        [orderItems]
    );
    const subscriptionDiscount = subscriptionActive ? displayItemsTotal * 0.2 : 0;
    const grandTotal = displayItemsTotal - subscriptionDiscount + totalDeliveryFee;
    const isStripePayment = paymentMethod === "STRIPE";

    const handleDeliverHere = (id) => {
        setAddressId(id);
        setStep("payment");
    };

    const placeOrder = async () => {
        if (orderItems.length === 0) {
            setError(productList.length === 0 ? "Product details are still loading. Please try again in a moment." : "Your cart is empty or contains unavailable products.");
            return;
        }
        if (!addressId) {
            setError("Please select a delivery address");
            setStep("address");
            return;
        }

        setPlacing(true);
        setError("");
        try {
            const res = await axios.post(
                url + "/api/order/place-order",
                {
                    addressId,
                    items: orderItems.map(({ product, name, price, size, quantity }) => ({
                        product,
                        name,
                        price,
                        size,
                        quantity,
                    })),
                    paymentMethod,
                    deliveryFee: totalDeliveryFee,
                    origin: window.location.origin,
                },
                { headers: { token } }
            );

            if (!res.data.success) {
                setError(res.data.message || "Failed to place order");
                return;
            }

            setCartItems({});

            // Stripe: send the browser to Stripe's hosted checkout.
            if (isStripePayment && res.data.session_url) {
                window.location.assign(res.data.session_url);
                return;
            }

            // COD (or any non-redirect method): order is already placed, go straight to order history.
            router.push("/profile");
        } catch (err) {
            console.error("placeOrder request failed:", err);
            setError(err.response?.data?.message || "Something went wrong while placing your order");
        } finally {
            setPlacing(false);
        }
    };

    if (step === "address") {
        return <SelectDeliveryAddress onDeliverHere={handleDeliverHere} />;
    }

    return (
        <>
            <Navbar />
            <main className="mx-auto mt-28 w-full max-w-3xl px-4 pb-12 sm:px-6 lg:mt-36">
            <div className="bg-white p-5 font-[Outfit] sm:border sm:border-gray-200 sm:p-8">
                <div className="mb-8 flex items-center justify-between border-b border-gray-200 pb-5">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-[0.24em] text-gray-400">Forever checkout</p>
                        <p className="mt-1 text-sm text-gray-500">Secure and simple</p>
                    </div>
                    <span className="text-sm text-gray-400">{step === "payment" ? "2 of 3" : "3 of 3"}</span>
                </div>
                {error && (
                    <div className="mb-4 border border-red-300 bg-red-50 text-red-700 text-sm p-3">
                        {error}
                    </div>
                )}

                {step === "payment" && (
                    <>
                        <Title text1="PAYMENT" text2="METHOD" />
                        <div className="mt-4 space-y-3">
                            {[
                                { key: "STRIPE", label: "Stripe" },
                                { key: "COD", label: "Cash on Delivery" },
                            ].map((m) => (
                                <label
                                    key={m.key}
                                    className={`flex items-center gap-3 border p-4 cursor-pointer ${paymentMethod === m.key ? "border-black" : "border-gray-300"
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        className="accent-black"
                                        checked={paymentMethod === m.key}
                                        onChange={() => setPaymentMethod(m.key)}
                                    />
                                    <span className="text-sm text-gray-700">{m.label}</span>
                                </label>
                            ))}
                        </div>

                        <div className="flex gap-4 mt-6">
                            <button
                                type="button"
                                onClick={() => setStep("address")}
                                className="text-left text-sm text-gray-600 hover:text-black hover:underline"
                            >
                                Change address
                            </button>
                            <button
                                type="button"
                                onClick={() => setStep("review")}
                                className="w-full bg-black px-8 py-3 text-sm tracking-wide text-white active:bg-gray-800 sm:w-auto"
                            >
                                {isStripePayment ? "CONTINUE TO STRIPE" : "USE THIS PAYMENT METHOD"}
                            </button>
                        </div>
                        {isStripePayment && (
                            <p className="mt-3 text-sm text-gray-500">
                                You will be redirected to Stripe Checkout to complete your payment securely.
                            </p>
                        )}
                    </>
                )}

                {step === "review" && (
                    <>
                        <Title text1="ORDER" text2="REVIEW" />

                        <div className="border border-gray-200 divide-y mt-4">
                            {orderItems.length === 0 ? (
                                <p className="p-4 text-sm text-gray-500">Your cart is empty.</p>
                            ) : (
                                orderItems.map((item, idx) => (
                                    <div key={idx} className="flex justify-between p-3 text-sm text-gray-700">
                                        <div className="flex items-center gap-2">
                                            {item.image && (
                                                <Image className="w-14 h-14 object-cover" src={url+"/images/"+item.image} alt={item.name} width={56} height={56} loading="eager" />
                                            )}
                                            <span>{item.name} ({item.size}) × {item.quantity}</span>
                                        </div>
                                        <span>${(item.displayPrice * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-6 w-full sm:w-1/2 ml-auto text-sm text-gray-700">
                            <div className="flex justify-between py-1">
                                <span>Subtotal</span>
                                <span>${displayItemsTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span>Delivery Fee</span>
                                <span>${totalDeliveryFee.toFixed(2)}</span>
                            </div>
                            {subscriptionActive && (
                                <div className="flex justify-between py-1 text-green-700">
                                    <span>Subscription discount (20%)</span>
                                    <span>-${subscriptionDiscount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between py-2 border-t border-gray-300 mt-2 font-medium text-black">
                                <span>Total</span>
                                <span>${grandTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <button
                                type="button"
                                onClick={() => setStep("payment")}
                                className="text-left text-sm text-gray-600 hover:text-black hover:underline"
                            >
                                Change payment method
                            </button>
                            <button
                                type="button"
                                disabled={placing || orderItems.length === 0}
                                onClick={placeOrder}
                                className="w-full bg-black px-8 py-3 text-sm tracking-wide text-white active:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                            >
                                {placing ? "PROCESSING..." : isStripePayment ? "PAY WITH STRIPE" : "PLACE ORDER"}
                            </button>
                        </div>
                    </>
                )}
            </div>
            </main>
        </>
    );
}