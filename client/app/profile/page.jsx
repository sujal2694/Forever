"use client"
import { useContext, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import { Context } from "../context/Context";
import { toast } from "react-toastify";
import { alphabetImage, states } from "../assets/assets";
import Footer from "../components/Footer";
import Image from "next/image";

const page = () => {
    const { url, dashboardLink, setDashboardLink, token, fetchUserId } = useContext(Context);
    const [addAddress, setAddAddress] = useState(false);
    const [user, setUser] = useState({
        name: "",
        email: "",
        number: ""
    })
    const [orders, setOrders] = useState([]);
    const [ordersQuantity, setOrdersQuantity] = useState(0);
    const [addressData, setAddressData] = useState({
        name: "",
        number: "",
        pincode: "",
        address: "",
        city: "",
        landmark: "",
        state: "",
    });
    const [fetchAddress, setFetchAddress] = useState([]);
    let [loading, setLoading] = useState(true);
    const [letter, setLetter] = useState("");
    const [editingAddressId, setEditingAddressId] = useState(null);

    const logOut = () => {
        localStorage.removeItem("token");
        window.location.href = "/login";
    }

    const dashboardLinkHandler = (link) => {
        localStorage.setItem("link", link);
        setDashboardLink(link);
    }

    const onChangeHandler = (e) => {
        const name = e.target.name;
        const value = e.target.value;
        setAddressData(addressData => ({ ...addressData, [name]: value }))
    }

    const addAddressHandler = async (e) => {
        e.preventDefault();
        try {
            const currentToken = localStorage.getItem("token");
            const config = { headers: { token: currentToken } };

            let response;
            if (editingAddressId) {
                // Edit existing address
                response = await axios.patch(`${url}/api/address/edit-address/${editingAddressId}`, addressData, config);
            } else {
                // Add new address
                response = await axios.post(`${url}/api/address/add-address`, addressData, config);
            }

            if (response.data.success) {
                setAddressData({
                    name: "",
                    number: "",
                    pincode: "",
                    address: "",
                    city: "",
                    landmark: "",
                    state: ""
                })
                setAddAddress(false);
                setEditingAddressId(null);
                await getAddress();
                toast.success(editingAddressId ? "Address updated successfully." : "Address added successfully.")
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Failed to save address");
        }
    }

    const cancelAddAddress = () => {
        setAddAddress(false);
        setEditingAddressId(null);
        setAddressData({
            name: "",
            number: "",
            pincode: "",
            address: "",
            city: "",
            landmark: "",
            state: ""
        })
    }

    const deleteAddress = async (addressId) => {
        const confirmed = window.confirm("Are you sure you want to delete this address?");
        if (!confirmed) return;
        const currentToken = localStorage.getItem("token");

        try {
            const response = await axios.delete(`${url}/api/address/delete-address/${addressId}`, {
                headers: { token: currentToken },
            });
            if (response.data.success) {
                toast.success("Address deleted successfully");
                await getAddress();
            } else {
                toast.error(response.data.message || "Failed to delete address");
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Failed to delete address");
        }
    }

    const fetchOrders = async (authToken = token) => {
        const currentToken = authToken || localStorage.getItem("token");
        if (!currentToken) return [];

        try {
            const response = await axios.get(`${url}/api/order/list-orders`, {
                headers: { token: currentToken },
            });
            if (response.data.success) {
                const fetchedOrders = response.data.orders || [];
                setOrders(fetchedOrders);
                return fetchedOrders;
            }
            return [];
        } catch (error) {
            console.log(error);
            if (error.response?.status === 401) {
                localStorage.removeItem("token");
            }
            return [];
        }
    }

    const handleCancelOrder = async (orderId) => {
        const currentToken = localStorage.getItem("token");
        if (!currentToken) {
            toast.error("Please login again.");
            return;
        }

        const confirmed = window.confirm("Are you sure you want to cancel this order?");
        if (!confirmed) return;

        try {
            const response = await axios.post(
                `${url}/api/order/cancel-order/${orderId}`,
                {},
                { headers: { token: currentToken } }
            );

            if (response.data.success) {
                setOrders((prev) => prev.filter((order) => order._id !== orderId));
                toast.success("Order cancelled and removed successfully.");
            } else {
                toast.error(response.data.message || "Failed to cancel order.");
            }
        } catch (error) {
            console.error("Cancel order failed:", error);
            toast.error(error.response?.data?.message || "Unable to cancel order.");
        }
    }

    const editAddress = (addr) => {
        setAddressData({
            name: addr.name,
            number: addr.number,
            pincode: addr.pincode,
            address: addr.address,
            city: addr.city,
            landmark: addr.landmark,
            state: addr.state
        });
        setEditingAddressId(addr._id);
        setAddAddress(true);
    }

    const getAddress = async () => {
        try {
            const currentToken = localStorage.getItem("token");
            if (!currentToken) return;
            const response = await axios.get(`${url}/api/address/list-address`, {
                headers: { token: currentToken },
            });
            if (response.data.success) {
                setFetchAddress(response.data.data || []);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const getUser = async () => {
        const currentToken = localStorage.getItem("token");
        if (!currentToken) return;

        try {
            const res = await axios.get(`${url}/api/user/profile`, {
                headers: { token: currentToken },
            });
            if (res.data.success) {
                setUser({
                    name: res.data.user?.name || "",
                    email: res.data.user?.email || "",
                    number: res.data.user?.number || ""
                });
                localStorage.setItem("name-letter", res.data.user?.name[0]);
            }
        } catch (error) {
            console.log(error);
            if (error.response?.status === 401) {
                localStorage.removeItem("token");
            }
        }
    };

    const getLetter = () => {
        const stored = localStorage.getItem("name-letter");
        return stored || "";
    }

    const getLink = () => {
        const stored = localStorage.getItem("link");
        return stored;
    }

    const totalSpent = () => {
        let amount = 0;
        orders.forEach((order) => {
            amount += order.totalAmount || 0;
        })
        return amount;
    }

    const totalAmountOfSpent = totalSpent().toFixed(1);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const currentToken = localStorage.getItem("token");
                if (currentToken) {
                    const fetchedOrders = await fetchOrders(currentToken);
                    setOrdersQuantity(fetchedOrders.length);
                    await getUser();
                }

                const storedLetter = getLetter();
                if (storedLetter) {
                    setLetter(storedLetter.toUpperCase());
                }
                await getAddress();
                const storedLink = getLink();
                if (storedLink) setDashboardLink(storedLink);
            } finally {
                // Always stop the loading spinner, whether or not a token existed
                // or any request failed.
                setLoading(false);
            }
        };
        fetchData();
    }, [token])

    if (loading) {
        return (
            <div className="min-h-screen py-10 px-4 mt-20 fade-in">
                <Navbar />
                <div className="flex items-center justify-center max-h-screen">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-dashboard rounded-full animate-spin"></div>
                </div>
                <Footer />
            </div>
        )
    }

    return (
        <div>
            <Navbar />
            <div className="min-h-screen py-10 px-4 mt-20 fade-in">
                <div className="max-w-6xl mx-auto bg-white rounded-lg">
                    <div className="py-8 *:bg-gray-500/0 rounded-tl-lg rounded-tr-lg">
                        <div className="flex items-center gap-2">
                            {alphabetImage && alphabetImage.length > 0 && alphabetImage.find(item => item.letter === letter) ? (
                                <Image
                                    src={alphabetImage.find(item => item.letter === letter)?.image.src}
                                    alt="profile"
                                    width={100}
                                    height={100}
                                    className="aspect-square w-20 rounded-full border-4 border-white object-cover"
                                    loading="eager"
                                ></Image>
                            ) : null}

                            <div>
                                <h1 className="text-3xl font-bold">
                                    {user.name}
                                </h1>
                                <p className="text-gray-800">
                                    {user.email}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-start gap-5">
                        <div className={`w-fit px-4 py-2 rounded-md font-semibold text-lg tracking-wider text-black cursor-pointer transition-all duration-300 ${dashboardLink === "Dashboard" ? "text-white bg-zinc-900" : "bg-slate-200/40"}`} onClick={() => dashboardLinkHandler("Dashboard")}>Dashboard</div>

                        <div className={`w-fit px-4 py-2 rounded-md font-semibold text-lg tracking-wider text-black cursor-pointer transition-all duration-300 ${dashboardLink === "Orders" ? "text-white bg-zinc-800" : "bg-slate-200/40"}`} onClick={() => dashboardLinkHandler("Orders")}>Orders</div>

                        <div className={`w-fit px-4 py-2 rounded-md font-semibold text-lg tracking-wider text-black cursor-pointer transition-all duration-300 ${dashboardLink === "Addresses" ? "text-white bg-zinc-800" : "bg-slate-200/40"}`} onClick={() => dashboardLinkHandler("Addresses")}>Addresses</div>
                    </div>
                    <div className="grid md:grid-cols-3">
                        <div className="md:col-span-3 p-8">
                            {dashboardLink === "Dashboard"
                                ? <>
                                    <div>
                                        <div className="flex justify-between items-center">
                                            <h2 className="text-2xl font-bold">
                                                Personal Information
                                            </h2>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6 mt-6">
                                            <div className="bg-zinc-500/10 backdrop-blur-3xl rounded-lg px-5 py-3">
                                                <label className="text-gray-500 text-sm">
                                                    Full Name
                                                </label>

                                                <p className="font-medium">
                                                    {user.name}
                                                </p>
                                            </div>

                                            <div className="bg-zinc-500/10 backdrop-blur-3xl rounded-lg px-5 py-3">
                                                <label className="text-gray-500 text-sm">
                                                    Email
                                                </label>

                                                <p className="font-medium">
                                                    {user.email}
                                                </p>
                                            </div>

                                            <div className="bg-zinc-500/10 backdrop-blur-3xl rounded-lg px-5 py-3">
                                                <label className="text-gray-500 text-sm">
                                                    Phone
                                                </label>

                                                <p className="font-medium">
                                                    {user.number}
                                                </p>
                                            </div>

                                            <div className="bg-zinc-500/10 backdrop-blur-3xl rounded-lg px-5 py-3">
                                                <label className="text-gray-500 text-sm">
                                                    Member Since
                                                </label>

                                                <p className="font-medium">
                                                    January 2025
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-3 grid-cols-2 gap-4 mt-10">
                                        <div className="bg-gray-800/10 backdrop-blur-3xl p-5 rounded-xl hover:shadow-button shadow-zinc-400 transition-all duration-300">
                                            <h3 className="text-3xl font-bold">
                                                {ordersQuantity}
                                            </h3>
                                            <p>
                                                Orders
                                            </p>
                                        </div>

                                        <div className="bg-gray-800/10 backdrop-blur-3xl p-5 rounded-xl hover:shadow-button shadow-zinc-400 transition-all duration-300">
                                            <h3 className="text-3xl font-bold">
                                                ${totalAmountOfSpent}
                                            </h3>
                                            <p>
                                                Total Spent
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex justify-end items-center gap-4 py-5 px-10">
                                        <button onClick={() => logOut()} className="bg-red-500/50 hover:bg-red-600 text-white font-bold py-2 px-8 rounded cursor-pointer" >
                                            Logout
                                        </button>
                                    </div>
                                </>
                                : ""
                            }

                            {dashboardLink === "Orders"
                                ? <div className="mt-10">
                                    <h2 className="text-2xl font-bold mb-5">
                                        Recent Orders
                                    </h2>

                                    <div className="space-y-6">
                                        {orders.length === 0 ? (
                                            <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-500">
                                                You have no orders yet.
                                            </div>
                                        ) : (
                                            orders.map((order, index) => (
                                                <div key={order._id || index} className="rounded-lg border border-gray-200 bg-gray-50 p-5">
                                                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                                        <div>
                                                            <p className="font-semibold">Order #{(order._id || "").slice(-6).toUpperCase()}</p>
                                                            <p className="text-sm text-gray-500">
                                                                {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "Recently placed"}
                                                            </p>
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="w-fit rounded-full bg-black px-3 py-1 text-sm text-white">
                                                                {(order.status) || "Pending"}
                                                            </span>
                                                            <span className="w-fit rounded-full bg-gray-200 px-3 py-1 text-sm text-gray-700">
                                                                {order.paymentMethod === "STRIPE" ? "Online Payment" : order.paymentMethod === "COD" ? "Cash on delivery" : order.paymentMethod || "Unknown"}
                                                            </span>
                                                            {order.paymentStatus ? (
                                                                <span className={`w-fit rounded-full px-3 py-1 text-sm ${order.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                                                    {order.paymentStatus === "paid" ? "Paid" : "Pending"}
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 space-y-2">
                                                        {order.items?.map((item, itemIndex) => (
                                                            <div key={`${order._id || index}-${itemIndex}`} className="flex items-center justify-between text-sm text-gray-700">
                                                                <span>{item.name} × {item.quantity}</span>
                                                                <span>${item.price * item.quantity}</span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="mt-4 flex flex-col gap-3 border-t border-gray-200 pt-3 text-sm text-gray-600 md:flex-row md:items-center md:justify-between">
                                                        <div>
                                                            <span>Total</span>
                                                            <span className="ml-2 font-semibold text-gray-900">${order.totalAmount || 0}</span>
                                                        </div>
                                                        <button
                                                            onClick={() => handleCancelOrder(order._id)}
                                                            disabled={order.status === 'delivered'}
                                                            className={
                                                                order.status === 'delivered'
                                                                    ? "w-fit rounded-md border border-red-100 px-3 py-2 text-red-200 transition-all cursor-not-allowed"
                                                                    : "w-fit rounded-md border border-red-300 px-3 py-2 text-red-600 transition-all hover:bg-red-50"
                                                            }
                                                        >
                                                            Cancel Order
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                                : ""
                            }

                            {dashboardLink === "Addresses"
                                ? <div>
                                    {!addAddress ? (
                                        <>
                                            {fetchAddress && fetchAddress.length === 0 ? (
                                                <div onClick={() => setAddAddress(true)} className="flex items-center gap-5 border border-gray-600/20 rounded-lg px-5 py-3 cursor-pointer hover:bg-gray-50 transition-all">
                                                    <p className="h-10 w-10 flex items-center justify-center bg-dashboard/40 rounded-full">
                                                        <i className="bx bx-plus"></i>
                                                    </p>
                                                    <p className="text-slate-700 tracking-wide text-lg">Add your first address</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex items-center justify-between mb-5">
                                                        <h3 className="text-xl font-semibold">Your Addresses</h3>
                                                        <button onClick={() => setAddAddress(true)} className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-all">
                                                            <i className="bx bx-plus"></i> Add New Address
                                                        </button>
                                                    </div>
                                                    <div className="space-y-4">
                                                        {fetchAddress && fetchAddress.length > 0 && fetchAddress.map((addr, index) => (
                                                            <div key={addr._id || index} className="flex flex-col md:flex-row items-start md:items-center justify-between border border-zinc-600/30 px-5 py-5 rounded-lg gap-5 hover:bg-gray-50 transition-all">
                                                                <div className="w-full flex items-start flex-col gap-2">
                                                                    <div className="flex items-center gap-3">
                                                                        <p className="text-2xl w-14 h-14 bg-zinc-800/80 flex items-center justify-center rounded-full text-white"><i className="bx bx-home"></i></p>
                                                                        <div>
                                                                            <h4 className="font-semibold text-lg">{addr.name}</h4>
                                                                            <p className="text-sm text-gray-600">{addr.address}, {addr.city}, {addr.state} {addr.pincode}</p>
                                                                            <p className="text-xs text-gray-500 mt-1">Phone: {addr.number}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="w-full md:w-auto flex items-center gap-3">
                                                                    <button onClick={() => editAddress(addr)} className="flex items-center gap-2 border border-zinc-600/30 rounded-lg p-2 px-3 cursor-pointer hover:bg-gray-400/20 transition-all"><i className="bx bx-pencil"></i> Edit</button>
                                                                    <button onClick={() => deleteAddress(addr._id)} className="flex items-center gap-2 border border-red-300 text-red-600 rounded-lg p-2 px-3 cursor-pointer hover:bg-red-50 transition-all"><i className="bx bx-trash"></i> Delete</button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <div className="border border-zinc-600/30 rounded-lg p-6 bg-gray-50">
                                            <h2 className="text-2xl font-semibold mb-6">{editingAddressId ? "Edit address" : "Add a new address"}</h2>
                                            <form className="w-full" onSubmit={addAddressHandler}>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                    <div className="flex flex-col">
                                                        <label className="text-md font-semibold tracking-wide mb-2">Full name *</label>
                                                        <input required type="text" name="name" value={addressData.name} onChange={onChangeHandler} className="border border-zinc-500 w-full rounded mt-1 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-black" />
                                                    </div>

                                                    <div className="flex flex-col">
                                                        <label className="text-md font-semibold tracking-wide mb-2">Mobile number *</label>
                                                        <input required type="tel" name="number" value={addressData.number} onChange={onChangeHandler} className="border border-zinc-500 w-full rounded mt-1 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-black" />
                                                    </div>

                                                    <div className="flex flex-col">
                                                        <label className="text-md font-semibold tracking-wide mb-2">Pincode *</label>
                                                        <input required type="text" name="pincode" value={addressData.pincode} onChange={onChangeHandler} className="border border-zinc-500 w-full rounded mt-1 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-black" />
                                                    </div>

                                                    <div className="flex flex-col md:col-span-2">
                                                        <label className="text-md font-semibold tracking-wide mb-2">Street Address *</label>
                                                        <input required type="text" name="address" value={addressData.address} onChange={onChangeHandler} placeholder="Flat, House no., Building, Company" className="border border-zinc-500 w-full rounded mt-1 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-black" />
                                                    </div>

                                                    <div className="flex flex-col md:col-span-2">
                                                        <label className="text-md font-semibold tracking-wide mb-2">Landmark (Optional)</label>
                                                        <input type="text" name="landmark" value={addressData.landmark} onChange={onChangeHandler} className="border border-zinc-500 w-full rounded mt-1 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-black" />
                                                    </div>

                                                    <div className="flex flex-col">
                                                        <label className="text-md font-semibold tracking-wide mb-2">Town/City *</label>
                                                        <input required type="text" name="city" value={addressData.city} onChange={onChangeHandler} className="border border-zinc-500 w-full rounded mt-1 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-black" />
                                                    </div>

                                                    <div className="flex flex-col">
                                                        <label className="text-md font-semibold tracking-wide mb-2">State *</label>
                                                        <select required name="state" value={addressData.state} onChange={onChangeHandler} className="border border-zinc-500 w-full rounded mt-1 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-black">
                                                            <option value="">Select State</option>
                                                            {states && states.length > 0 && states.map((item, index) => {
                                                                return (
                                                                    <option key={item || index} value={item}>{item}</option>
                                                                )
                                                            })}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-end gap-4 mt-8">
                                                    <button type="button" onClick={cancelAddAddress} className="px-6 py-2 border border-zinc-600 text-black rounded-lg hover:bg-gray-100 transition-all">
                                                        Cancel
                                                    </button>
                                                    <button type="submit" className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all">
                                                        {editingAddressId ? "Update Address" : "Add Address"}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    )}
                                </div>
                                : ""
                            }

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default page