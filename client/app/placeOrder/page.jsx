"use client"
import axios from "axios";
import { useContext, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Context } from "../context/Context";
import Navbar from "../components/Navbar";
import Title from "../components/Title";
import SelectDeliveryAddress from "../components/SelectDeliveryAddress";
import { products } from "../assets/assets";
import Image from "next/image";

export default function PlaceOrder() {
    const { url, cartItems, productList, currency, token } = useContext(Context);
    const availableProducts = productList?.length ? productList : products;

    const router = useRouter();

    const [step, setStep] = useState("address");
    const [addressId, setAddressId] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [placing, setPlacing] = useState(false);
    const [error, setError] = useState("");

    // cartItems is flat: { [itemId]: quantity } — same shape the cart page reads
    const orderItems = useMemo(() => {
        const flat = [];
        for (const itemId in cartItems || {}) {
            const quantity = cartItems[itemId];
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
                        quantity,
                        deliveryFee: quantity * (itemInfo.price * currency * 0.001),
                    });
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
    const grandTotal = displayItemsTotal + totalDeliveryFee;

    const handleDeliverHere = (id) => {
        setAddressId(id);
        setStep("payment");
    };

    const placeOrder = async () => {
        if (orderItems.length === 0) {
            setError("Your cart is empty");
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
                    items: orderItems.map(({ product, name, price, quantity }) => ({ product, name, price, quantity })),
                    paymentMethod,
                    deliveryFee: totalDeliveryFee,
                    origin: window.location.origin, // lets the backend build correct success/cancel URLs
                },
                { headers: { token } }
            );

            if (!res.data.success) {
                setError(res.data.message || "Failed to place order");
                return;
            }

            // Stripe: don't navigate to /orders yet — send the browser to Stripe's hosted checkout.
            // The order already exists in your DB (unpaid) and gets confirmed on /verify after redirect back.
            if (paymentMethod === "STRIPE" && res.data.session_url) {
                window.location.replace(res.data.session_url);
                return;
            }

            // COD (or any non-redirect method): order is already placed, go straight to order history.
            router.push("/orders");
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
            <div className="max-w-3xl mx-auto bg-white border border-gray-200 p-6 mt-32 font-[Outfit]">
                {error && (
                    <div className="mb-4 border border-red-300 bg-red-50 text-red-700 text-sm p-3">
                        {error}
                    </div>
                )}

                {step === "payment" && (
                    <>
                        <Title text1="PAYMENT" text2="METHOD" />
                        <div className="space-y-3 mt-4">
                            {[
                                { key: "STRIPE", label: "Stripe" },
                                { key: "RAZORPAY", label: "Razorpay" },
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
                                className="text-sm text-gray-600 hover:text-black hover:underline"
                            >
                                Change address
                            </button>
                            <button
                                type="button"
                                onClick={() => setStep("review")}
                                className="bg-black text-white text-sm px-8 py-3 tracking-wide active:bg-gray-800"
                            >
                                USE THIS PAYMENT METHOD
                            </button>
                        </div>
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
                                                <Image className="w-14 h-14 object-cover" src={item.image} alt={item.name} width={56} height={56} />
                                            )}
                                            <span>{item.name} × {item.quantity}</span>
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
                            <div className="flex justify-between py-2 border-t border-gray-300 mt-2 font-medium text-black">
                                <span>Total</span>
                                <span>${grandTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-6">
                            <button
                                type="button"
                                onClick={() => setStep("payment")}
                                className="text-sm text-gray-600 hover:text-black hover:underline"
                            >
                                Change payment method
                            </button>
                            <button
                                type="button"
                                disabled={placing || orderItems.length === 0}
                                onClick={placeOrder}
                                className="bg-black text-white text-sm px-8 py-3 tracking-wide active:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {placing ? "PLACING ORDER..." : "PLACE ORDER"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}