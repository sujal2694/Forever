import React, { useContext, useEffect, useState, useMemo } from "react";
import { Context } from "../context/Context";
import toast from "react-hot-toast";
import axios from "axios";
import { Spinner } from "@/components/ui/spinner";

const Orders = () => {
    const { url } = useContext(Context);

    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [updatingOrderId, setUpdatingOrderId] = useState(null);

    const fetchOrders = async () => {
        try {
            setLoading(true);

            const adminToken = localStorage.getItem("adminToken");

            if (!adminToken) {
                toast.error("Please login again");
                return;
            }

            const orderRes = await axios.get(url + '/api/order/admin/list-orders', {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            const userRes = await axios.get(url + '/api/user/list-users');
            const addressRes = await axios.get(url + '/api/address/addresses', {
                headers: { Authorization: `Bearer ${adminToken}` }
            });

            if (orderRes.data.success) {
                setOrders(orderRes.data.orders);
            }
            if (userRes.data.success) {
                setUsers(userRes.data.users);
            }
            if (addressRes.data.success) {
                setAddresses(addressRes.data.addresses);
            }

        } catch (error) {
            console.error("Fetch orders error:", error);
            toast.error(
                error.response?.data?.message ||
                "Orders fetching failed"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (url) {
            fetchOrders();
        }
    }, [url]);

    const usersById = useMemo(() => {
        const map = {};
        users.forEach((u) => {
            map[u._id] = u;
        });
        return map;
    }, [users]);

    const addressById = useMemo(() => {
        const map = {};
        if (Array.isArray(addresses)) {
            addresses.forEach((a) => {
                map[a._id] = a;
            });
        }
        return map;
    }, [addresses]);

    const handleStatusChange = async (orderId, newStatus) => {
        const adminToken = localStorage.getItem("adminToken");

        if (!adminToken) {
            toast.error("Please login again");
            return;
        }

        // Keep the previous status so we can roll back if the request fails
        const previousOrders = orders;

        // Optimistically update the UI immediately
        setOrders((prev) =>
            prev.map((order) =>
                order._id === orderId ? { ...order, status: newStatus } : order
            )
        );
        setUpdatingOrderId(orderId);

        try {
            const res = await axios.post(
                url + "/api/order/admin/update-status",
                { orderId, status: newStatus },
                { headers: { Authorization: `Bearer ${adminToken}` } }
            );

            if (res.data.success) {
                toast.success("Order status updated");
            } else {
                // Roll back on a soft failure
                setOrders(previousOrders);
                toast.error(res.data.message || "Failed to update status");
            }
        } catch (error) {
            console.error("Update status error:", error);
            setOrders(previousOrders);
            toast.error(
                error.response?.data?.message || "Failed to update status"
            );
        } finally {
            setUpdatingOrderId(null);
        }
    };

    return (
        <div className="p-5 max-sm:p-3">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-xl tracking-wide">Orders</h1>
                    <p className="text-sm text-gray-500">
                        {orders.length} order
                        {orders.length !== 1 ? "s" : ""} to fulfil.
                    </p>
                </div>

                <div>
                    <button onClick={fetchOrders} className="flex items-center justify-center gap-3 border border-gray-400/40 bg-gray-300/20 px-5 py-3 rounded-md cursor-pointer">
                        <i className="bx bx-refresh-ccw-alt text-sm"></i>
                        <p className="text-sm text-zinc-800">Reload</p>
                    </button>
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center mt-20">
                    <Spinner className="size-8" />
                </div>
            )}

            {/* Orders */}
            {!loading && orders.length > 0 && (
                <div className="space-y-4">
                    {orders.map((order) => {
                        const orderUser = usersById[order.userId];
                        const orderAddress = addressById[order.addressId];

                        return (
                            <div key={order._id} className="border p-4">
                                <div className="flex justify-between max-sm:flex-col max-lg:flex-col gap-4">

                                    <div className="flex items-center max-sm:items-start gap-5 max-sm:flex-col">
                                        <div className="border border-gray-500/30 w-18 h-18 flex items-center justify-center">
                                            <i className="bx bx-package max-sm:text-2xl text-4xl text-gray-400"></i>
                                        </div>

                                        <div>
                                            <div className="leading-5 text-sm">
                                                {order.items.map((item, idx) => (
                                                    <p key={item._id || idx}>{item.name} x {item.quantity} {item.size}</p>
                                                ))}
                                            </div>

                                            {/* Matched user info */}
                                            <div className="mt-2 text-xs text-gray-500">
                                                {orderUser && (
                                                    <>
                                                        <p className="font-medium text-gray-700">{orderUser.name}</p>
                                                        <p>{orderUser.email}</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        {/* Address */}
                                        <p className="font-semibold text-gray-700 text-sm">Deliver to:</p>
                                        {orderAddress ? (
                                            <>
                                                <div className="mt-2 text-xs text-gray-500">
                                                    <p>{orderAddress.name}, {orderAddress.address}, {orderAddress.landmark}</p>
                                                    <p>{orderAddress.city}, {orderAddress.state} - {orderAddress.pincode}</p>
                                                    <p>{orderAddress.number}</p>
                                                </div>
                                            </>
                                        ) : (
                                            <p className="text-xs text-gray-500 tracking-wider">Address not found</p>
                                        )
                                        }
                                    </div>

                                    <div>
                                        <p className="text-xs tracking-wide text-gray-500">Items: {order.items.length}</p>
                                        <p className="text-xs tracking-wide text-gray-500">Method: {order.paymentMethod}</p>
                                        <p className="text-xs tracking-wide text-gray-500">Status: {order.status}</p>
                                        <p className="text-xs tracking-wide text-gray-500">Date: {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—"}</p>
                                    </div>

                                    <p className="text-lg font-semibold tracking-wide">${order.totalAmount}</p>

                                    <select
                                        value={order.status}
                                        disabled={updatingOrderId === order._id}
                                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                        className="border border-gray-300 px-2 py-3 h-fit text-sm tracking-wide focus:border-black rounded-md disabled:opacity-50"
                                    >
                                        <option value="placed">Order Placed</option>
                                        <option value="packing">Packing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="out-for-delivery">Out for delivery</option>
                                        <option value="delivered">Delivered</option>
                                    </select>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* No orders */}
            {!loading && orders.length === 0 && (
                <div className="text-center mt-20 text-gray-500">
                    <p>No orders found.</p>
                </div>
            )}
        </div>
    );
};

export default Orders;