"use client"
import { useContext, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import { Context } from "../context/Context";
import jwt from 'jsonwebtoken'
import { toast } from "react-toastify";
import { alphabetImage, states } from "../assets/assets";

const page = () => {
    const { url } = useContext(Context);
    const [dashboardLink, setDashboardLink] = useState("Dashboard");
    const [addAddress, setAddAddress] = useState(false);
    const [user, setUser] = useState({
        name: "",
        email: "",
        number: ""
    })
    const [addressData, setAddressData] = useState([]);
    const [image, setImage] = useState(null);
    const [letter, setLetter] = useState("");


    const orders = [
        { id: "ORD123456", status: "Delivered", amount: "$100.00" },
    ]

    const deocdeToken = () => {
        const token = localStorage.getItem("token");
        const decoded = jwt.decode(token);
        return decoded
    }

    const logOUt = () => {
        localStorage.removeItem("token");
        window.location.href = "/login";
    }

    const getUser = async () => {
        const response = await axios.get(`${url}` + "/api/user/list-user");
        const userId = deocdeToken().id;
        if (response.data.success) {
            for (let i = 0; i < response.data.users.length; i++) {
                if (response.data.users[i]._id === userId) {
                    setUser({
                        name: response.data.users[i].name,
                        email: response.data.users[i].email,
                        number: response.data.users[i].number
                    })
                    const userName = response.data.users[i].name;
                    localStorage.setItem("name-letter", Array.from(userName)[0])
                }
            }
        } else {
            console.log(error);
            toast.error("someting went wrong");
        }
    }

    const getLetter = () => {
        return (localStorage.getItem("name-letter"));
    }

    useEffect(() => {
        const fetchData = async () => {
            await getUser();
            const storedLetter = getLetter();
            setLetter(storedLetter.toUpperCase());
        };
        fetchData();

    }, [])

    return (
        <div>
            <Navbar />
            <div className="min-h-screen py-10 px-4 mt-20">
                <div className="max-w-6xl mx-auto bg-white rounded-lg">

                    <div className="p-8 *:bg-gray-500/0 rounded-tl-lg rounded-tr-lg">
                        <div className="flex items-center gap-5">
                            {alphabetImage.map((item, index) => {
                                for (let i = 0; i < alphabetImage.length; i++) {
                                    if (item.letter[i] === letter) {
                                        return (
                                            <div key={index}>
                                                <img
                                                    src={item.image.src}
                                                    alt="profile"
                                                    className="w-24 h-24 rounded-full border-4 border-white contain"
                                                    fetchPriority="high"
                                                />
                                            </div>
                                        )
                                    }
                                }
                            })}

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
                        <div className={`w-fit px-4 py-2 rounded-md font-semibold text-lg tracking-wider bg-slate-200/40 backdrop-blur-2xl text-black cursor-pointer transition-all duration-300 ${dashboardLink === "Dashboard" ? "text-white bg-zinc-800" : ""}`} onClick={() => setDashboardLink("Dashboard")}>Dashboard</div>

                        <div className={`w-fit px-4 py-2 rounded-md font-semibold text-lg tracking-wider bg-slate-200/40 backdrop-blur-2xl text-black cursor-pointer transition-all duration-300 ${dashboardLink === "Orders" ? "text-white bg-zinc-800" : ""}`} onClick={() => setDashboardLink("Orders")}>Orders</div>

                        <div className={`w-fit px-4 py-2 rounded-md font-semibold text-lg tracking-wider bg-slate-200/40 backdrop-blur-2xl text-black cursor-pointer transition-all duration-300 ${dashboardLink === "Addresses" ? "text-white bg-zinc-800" : ""}`} onClick={() => setDashboardLink("Addresses")}>Addresses</div>
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
                                        <div className="bg-gray-800/60 backdrop-blur-3xl text-white p-5 rounded-xl">
                                            <h3 className="text-3xl font-bold">
                                                0
                                            </h3>
                                            <p>
                                                Orders
                                            </p>
                                        </div>

                                        <div className="bg-gray-800/60 backdrop-blur-3xl text-white p-5 rounded-xl">
                                            <h3 className="text-3xl font-bold">
                                                0
                                            </h3>
                                            <p>
                                                Total Spent
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex justify-end items-center gap-4 py-5 px-10">
                                        <button onClick={() => logOUt()} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-8 rounded" >
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

                                    <div className="space-y-4">
                                        {orders.map((order) => (
                                            <div
                                                key={order.id}
                                                className="border rounded-xl p-4 flex justify-between items-center"
                                            >
                                                <div>
                                                    <h4 className="font-semibold">
                                                        {order.id}
                                                    </h4>

                                                    <p className="text-sm text-gray-500">
                                                        {order.status}
                                                    </p>
                                                </div>

                                                <span className="font-bold">
                                                    {order.amount}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                : ""
                            }

                            {dashboardLink === "Addresses"
                                ? <div>
                                    {(addressData.length !== 0)
                                        ? <> <div onClick={() => setAddAddress(true)} className={`flex items-center gap-5 border border-gray-600/20 rounded-lg px-5 py-3 cursor-pointer ${addAddress ? "hidden" : "block"}`}>
                                            <p className="h-10 w-10 flex items-center justify-center bg-zinc-600/30 rounded-full">
                                                <i className="bx bx-plus"></i>
                                            </p>
                                            <p className="text-slate-700 tracking-wide text-lg">Add your address</p>
                                        </div>
                                            {addAddress
                                                ? <>
                                                    <div className="w-full -mx-5">
                                                        <h2 className="text-2xl font-semibold">Add a new address</h2>
                                                        <form className="w-full mt-5">
                                                            <div className="flex flex-col items-start justify-start mt-4">
                                                                <label className="text-md font-semibold tracking-wide">Full name</label>
                                                                <input type="text" className="border border-zinc-500 w-full rounded mt-1 py-1  px-3" />
                                                            </div>

                                                            <div className="flex flex-col items-start justify-start mt-4">
                                                                <label className="text-md font-semibold tracking-wide">Mobile number</label>
                                                                <input type="number" className="border border-zinc-500 w-full rounded mt-1 py-1  px-3" />
                                                            </div>

                                                            <div className="flex flex-col items-start justify-start mt-4">
                                                                <label className="text-md font-semibold tracking-wide">Pincode</label>
                                                                <input type="number" className="border border-zinc-500 w-full rounded mt-1 py-1  px-3" />
                                                            </div>

                                                            <div className="flex flex-col items-start justify-start mt-4">
                                                                <label className="text-md font-semibold tracking-wide">FLat, House no., Building, Company, Apartment</label>
                                                                <input type="text" className="border border-zinc-500 w-full rounded mt-1 py-1  px-3" />
                                                            </div>

                                                            <div className="flex flex-col items-start justify-start mt-4">
                                                                <label className="text-md font-semibold tracking-wide">Area, Street, Sector, Village</label>
                                                                <input type="text" className="border border-zinc-500 w-full rounded mt-1 py-1  px-3" />
                                                            </div>

                                                            <div className="flex flex-col items-start justify-start mt-4">
                                                                <label className="text-md font-semibold tracking-wide">Landmark</label>
                                                                <input type="text" className="border border-zinc-500 w-full rounded mt-1 py-1  px-3" />
                                                            </div>

                                                            <div className="flex items-center justify-start gap-4 mt-4">
                                                                <div>
                                                                    <label className="text-md font-semibold tracking-wide">Town/City</label>
                                                                    <input type="text" className="border border-zinc-500 rounded mt-1 py-1  px-3" />
                                                                </div>

                                                                <div>
                                                                    <label className="text-md font-semibold tracking-wide">States</label>
                                                                    <select className="border border-zinc-500 w-full rounded mt-1 p-1">
                                                                        {states.map((item, index) => {
                                                                            return (
                                                                                <option key={index} value="">{item}</option>
                                                                            )
                                                                        })}
                                                                    </select>
                                                                </div>
                                                            </div>
                                                            <button className="p-3 bg-black text-white my-3 rounded-full px-5">Add address</button>
                                                        </form>
                                                    </div>
                                                </>
                                                : ""
                                            }
                                        </>
                                        : <div className="flex flex-col md:flex-row items-center justify-start border border-zinc-600/30 px-5 py-5 rounded-lg gap-5">
                                            <div className="w-full flex items-center gap-5">
                                                <p className="text-2xl w-14 h-14 bg-zinc-800/80 flex items-center justify-center rounded-full text-white"><i className="bx bx-home"></i></p>
                                                <p className="text-xl font-light">address</p>
                                            </div>

                                            <div className="w-60 flex items-center justify-between">
                                                <p className="flex items-center gap-3 border border-zinc-600/30 rounded-lg p-1 px-2 cursor-pointer hover:bg-gray-400/20 transition-all duration-300"><i className="bx bx-pencil"></i> Edit address</p>
                                                <i className="bx bx-trash text-2xl text-red-600 cursor-pointer"></i>
                                            </div>
                                        </div>}
                                    <div>

                                    </div>
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
