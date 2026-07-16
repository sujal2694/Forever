"use client"
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Context } from "../context/Context";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Title from "../components/Title";

export default function SelectDeliveryAddress({ onDeliverHere }) {
    const { url, setDashboardLink } = useContext(Context);
    const [addresses, setAddresses] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const res = await axios.get(url + "/api/address/list-address", {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                if (res.data.success) {
                    const list = res.data.data;
                    setAddresses(list);
                    const def = list.find((a) => a.isDefault) || list[0];
                    if (def) setSelectedId(def._id);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchAddresses();
    }, [url]);

    const selectedAddress = addresses.find((a) => a._id === selectedId);

    return (
        <>
            <Navbar />
            <div className="max-w-3xl mx-auto bg-white border border-gray-200 p-6 mt-32 font-[Outfit]">
                <Title text1="SELECT" text2="DELIVERY ADDRESS" />

                {selectedAddress?.otpRequired && (
                    <div className="flex flex-col gap-1 border border-gray-300 bg-gray-50 p-4 mb-6 mt-2">
                        <div className="flex items-center gap-2">
                            <span aria-hidden="true">⚠️</span>
                            <span className="font-medium text-sm text-gray-700">One-time password required at time of delivery</span>
                        </div>
                        <p className="text-sm text-gray-500">
                            Please ensure someone will be available to receive this delivery.{" "}
                            <a href="#" className="text-gray-700 underline hover:text-black">
                                Learn more.
                            </a>
                        </p>
                    </div>
                )}

                <hr className="border-gray-200 mb-4" />

                <h2 className="text-sm text-gray-500 mb-3">Delivery addresses ({addresses.length})</h2>

                {loading ? (
                    <p className="text-sm text-gray-400">Loading addresses…</p>
                ) : addresses.length === 0 ? (
                    <p className="text-sm text-gray-400 mb-4">No saved addresses yet.</p>
                ) : (
                    <div className="space-y-4 mb-4">
                        {addresses.map((item) => (
                            <div key={item._id} className="flex items-start gap-3">
                                <input
                                    type="radio"
                                    name="deliveryAddress"
                                    className="mt-1 accent-black w-4 h-4"
                                    checked={selectedId === item._id}
                                    onChange={() => setSelectedId(item._id)}
                                />
                                <div className="text-sm leading-6 text-gray-700">
                                    <p className="font-medium text-black">{item.fullName}</p>
                                    <p>
                                        {item.address}, {item.city}, {item.state.toUpperCase()}, {item.pincode}, {item.country}
                                    </p>
                                    <p>Phone number: {item.phone}</p>
                                    <p className="mt-1">
                                        <a href="#" className="text-gray-600 hover:text-black hover:underline">
                                            Edit address
                                        </a>
                                        <span className="text-gray-300 mx-2">|</span>
                                        <a href="#" className="text-gray-600 hover:text-black hover:underline">
                                            Add delivery instructions
                                        </a>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <Link
                    onClick={() => setDashboardLink("Addresses")}
                    href="/profile"
                    className="text-sm text-gray-600 hover:text-black hover:underline block mb-6">
                    Add a new delivery address
                </Link>

                <button
                    type="button"
                    disabled={!selectedId}
                    onClick={() => onDeliverHere && onDeliverHere(selectedId)}
                    className="bg-black text-white text-sm px-8 py-3 tracking-wide active:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    DELIVER TO THIS ADDRESS
                </button>
            </div>
        </>
    );
}