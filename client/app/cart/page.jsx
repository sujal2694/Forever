"use client"
import Image from "next/image"
import Navbar from "../components/Navbar"
import { products } from "../assets/assets"
import Footer from "../components/Footer"
import { useContext } from "react"
import { Context } from "../context/Context"

const Page = () => {
    const { cartItems, addToCart, removeFromCart, productList, currency } = useContext(Context);
    const availableProducts = productList?.length ? productList : products;
    const cartEntries = Object.entries(cartItems || {}).filter(([, quantity]) => quantity > 0);

    const totalProducts = cartEntries.reduce((sum, [, quantity]) => sum + quantity, 0);
    const subtotal = cartEntries.reduce((total, [itemId, quantity]) => {
        const itemInfo = availableProducts.find((product) => product._id === itemId);
        return total + (itemInfo?.price || 0) * quantity;
    }, 0);

    return (
        <div>
            <Navbar />
            <div className="w-[95vw] m-auto mt-28 border-b border-gray-600/30 fade-in">
                <div className="flex items-center justify-center">
                    <h2 className="flex items-center gap-3 text-4xl uppercase text-gray-600"><span className="text-black">Your</span> Cart <p className="bg-black h-[2] w-20"></p></h2>
                </div>

                <div className="flex items-start justify-between lg:flex-row flex-col">
                    <div className="border border-rose-500/30 md:m-10 mt-10 m-2 pb-5 w-full">
                        <div>
                            <ul className="grid md:grid-cols-7 grid-cols-6 bg-primary/30 text-center border-b border-rose-500/70">
                                <li className="border-r border-rose-500/70 py-2 md:block hidden">No.</li>
                                <li className="border-r border-rose-500/70 py-2">Image</li>
                                <li className="border-r border-rose-500/70 py-2 col-span-2">Product Name</li>
                                <li className="border-r border-rose-500/70 py-2">Price</li>
                                <li className="border-r border-rose-500/70 py-2">Quantity</li>
                                <li className="py-2">Remove</li>
                            </ul>
                        </div>

                        <div>
                            {cartEntries.length === 0 ? (
                                <div className="p-6 text-center text-gray-500">Your cart is empty.</div>
                            ) : cartEntries.map(([itemId, quantity], index) => {
                                const itemInfo = availableProducts.find((product) => product._id === itemId);
                                if (!itemInfo) return null;
                                const imageSrc = Array.isArray(itemInfo.image) ? itemInfo.image[0] : itemInfo.image;
                                return (
                                    <div key={itemId} className="grid md:grid-cols-7 grid-cols-6 p-2 transition-all duration-300">
                                        <p className="text-xl text-center md:block hidden">{index + 1}</p>
                                        <div className="flex justify-center">
                                            <Image className="w-20" src={imageSrc} alt="image" width={80} height={80}></Image>
                                        </div>
                                        <p className="text-sm text-center col-span-2">{itemInfo.name}</p>
                                        <p className="text-center">${(itemInfo.price * currency) / 20}</p>
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => removeFromCart(itemId)} className="p-1 bg-rose-200 rounded-full h-8 w-8 flex items-center justify-center">
                                                <i className="bx bx-minus"></i>
                                            </button>
                                            <span>{quantity}</span>
                                            <button onClick={() => addToCart(itemId)} className="p-1 bg-rose-200 rounded-full h-8 w-8 flex items-center justify-center">
                                                <i className="bx bx-plus"></i>
                                            </button>
                                        </div>
                                        <button onClick={() => removeFromCart(itemId)} className="text-red-600 text-center">X</button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex justify-center lg:w-1/2 w-full">
                        <div className="border border-gray-600/20 w-full rounded-sm md:m-10 mt-20 mb-20 m-2 p-6 shadow shadow-gray-500/30">
                            <h2 className="text-4xl py-2">Cart Total</h2>
                            <div className="w-full border-t border-slate-500/50 py-3">
                                <ul className="text-xl font-light grid gap-4">
                                    <li className="flex items-center justify-between">Total products:<span>{totalProducts}</span></li>
                                    <li className="flex items-center justify-between">MRP: <span>${subtotal}</span></li>
                                    <li className="flex items-center justify-between">Discounts: <span>-$0</span></li>
                                    <p className="w-full bg-gray-700/50 h-0.5"></p>
                                    <li className="flex items-center justify-between">Total price: <span>${subtotal}</span></li>
                                </ul>
                                <button className="my-3 text-center w-full bg-gray-600 py-3 text-white uppercase tracking-wider font-semibold rounded-sm focus:bg-gray-600/70 transition-all duration-300 cursor-pointer">proceed to pay</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Page
