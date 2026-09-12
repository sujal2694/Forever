"use client"
import Image from "next/image"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { useContext, useEffect, useState } from "react"
import { Context } from "../context/Context"
import Link from "next/link"
import axios from "axios"

const Page = () => {
    const { cartItems, addToCart, removeFromCart, url, isLogedin } = useContext(Context);
    const [availableProducts, setAvailableProducts] = useState([]);

    const fetchAvailableProducts = async () => {
        try {
            const res = await axios.get(url + "/api/product/list-product");
            if (res.data.success) {
                setAvailableProducts(res.data.data);
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        // Product loading owns the async state updates and runs when the API URL is available.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchAvailableProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url]);

    const cartEntries = Object.entries(cartItems || {}).flatMap(([itemId, sizes]) =>
        Object.entries(sizes || {})
            .filter(([, quantity]) => quantity > 0)
            .map(([size, quantity]) => ({ itemId, size, quantity }))
    );

    const totalProducts = cartEntries.reduce((sum, { quantity }) => sum + quantity, 0);

    const subtotal = cartEntries.reduce((total, { itemId, quantity }) => {
        const itemInfo = availableProducts.find((product) => product._id === itemId);
        if (!itemInfo) return total;
        return total + itemInfo.price * quantity;
    }, 0);

    const handlePay = () => {
        if (subtotal === 0) {
            alert("Your cart is empty. Please add some products");
        }
    }

    if (!isLogedin) {
        return (
            <div className="w-screen h-screen flex items-center justify-center">
                <Navbar />
                <div className="text-center">
                    <h1 className="mb-4 text-2xl font-mono">You are not loged in.</h1>
                    <Link href={'/login'}>
                        <button className="border-none bg-zinc-300/20 px-5 py-2 rounded-2xl text-base text-zinc-800 cursor-pointer tracking-wider">
                            <p>Login / Sign Up</p>
                        </button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div>
            <Navbar />
            <main className="mx-auto mt-28 w-full max-w-7xl px-4 pb-8 fade-in sm:px-6 lg:px-8">
                <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="mb-2 text-xs font-medium uppercase tracking-[0.25em] text-gray-400">Your selection</p>
                        <h1 className="text-3xl font-medium tracking-tight text-gray-900 sm:text-4xl">Your cart</h1>
                    </div>
                    <p className="text-sm text-gray-500">{totalProducts} item{totalProducts === 1 ? "" : "s"}</p>
                </div>

                <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
                    <section className="min-w-0 border border-gray-200 bg-white" aria-label="Cart items">
                        {cartEntries.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 sm:p-12">
                                <p>Your cart is empty.</p>
                                <Link href="/collection" className="mt-5 inline-block bg-gray-100 px-5 py-3 text-sm text-gray-800 transition hover:bg-gray-200">See products</Link>
                            </div>
                        ) : (
                            <>
                                <div className="hidden overflow-x-auto sm:block">
                                    <div style={{ minWidth: "42rem" }}>
                                        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                                            <div className="py-3">No.</div><div className="py-3">Image</div><div className="col-span-2 py-3">Product</div><div className="py-3">Size</div><div className="py-3">Price</div><div className="py-3">Quantity</div>
                                        </div>
                                        {cartEntries.map(({ itemId, size, quantity }, index) => {
                                            const itemInfo = availableProducts.find((product) => product._id === itemId);
                                            if (!itemInfo) return null;
                                            const imageSrc = Array.isArray(itemInfo.images) ? itemInfo.images[0] : itemInfo.image;
                                            return (
                                                <div key={`${itemId}-${size}`} className="grid grid-cols-7 items-center border-b border-gray-100 p-3 last:border-b-0 hover:bg-gray-50">
                                                    <p className="text-center text-sm text-gray-500">{index + 1}</p>
                                                    <div className="flex justify-center">{imageSrc ? <Image className="h-16 w-16 object-cover" src={imageSrc.startsWith("http") ? imageSrc : `${url}/images/${imageSrc}`} alt={itemInfo.name || "Product image"} width={64} height={64} loading="eager" unoptimized /> : <div className="flex h-16 w-16 items-center justify-center bg-gray-100 text-xs text-gray-400">No image</div>}</div>
                                                    <p className="col-span-2 px-2 text-center text-sm leading-5">{itemInfo.name}</p>
                                                    <p className="text-center text-sm font-medium">{size}</p>
                                                    <p className="text-center text-sm">${itemInfo.price}</p>
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button type="button" aria-label={`Decrease ${itemInfo.name}`} onClick={() => removeFromCart(itemId, size)} className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 hover:bg-rose-200"><i className="bx bx-minus"></i></button>
                                                        <span className="min-w-5 text-center text-sm">{quantity}</span>
                                                        <button type="button" aria-label={`Increase ${itemInfo.name}`} onClick={() => addToCart(itemId, size)} className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 hover:bg-rose-200"><i className="bx bx-plus"></i></button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="space-y-3 p-3 sm:hidden">
                                    {cartEntries.map(({ itemId, size, quantity }) => {
                                        const itemInfo = availableProducts.find((product) => product._id === itemId);
                                        if (!itemInfo) return null;
                                        const imageSrc = Array.isArray(itemInfo.images) ? itemInfo.images[0] : itemInfo.image;
                                        return (
                                            <article key={`${itemId}-${size}`} className="flex gap-3 border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                                                {imageSrc ? <Image className="h-20 w-20 shrink-0 object-cover" src={imageSrc.startsWith("http") ? imageSrc : `${url}/images/${imageSrc}`} alt={itemInfo.name || "Product image"} width={80} height={80} loading="eager" unoptimized /> : <div className="flex h-20 w-20 shrink-0 items-center justify-center bg-gray-100 text-xs text-gray-400">No image</div>}
                                                <div className="min-w-0 flex-1">
                                                    <h2 className="line-clamp-2 text-sm font-medium text-gray-900">{itemInfo.name}</h2>
                                                    <p className="mt-1 text-xs text-gray-500">Size: {size} · ${itemInfo.price}</p>
                                                    <div className="mt-3 flex items-center justify-between">
                                                        <div className="flex items-center gap-2"><button type="button" aria-label={`Decrease ${itemInfo.name}`} onClick={() => removeFromCart(itemId, size)} className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100"><i className="bx bx-minus"></i></button><span className="min-w-5 text-center text-sm">{quantity}</span><button type="button" aria-label={`Increase ${itemInfo.name}`} onClick={() => addToCart(itemId, size)} className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100"><i className="bx bx-plus"></i></button></div>
                                                        <button type="button" aria-label={`Remove ${itemInfo.name}`} onClick={() => { for (let index = 0; index < quantity; index += 1) removeFromCart(itemId, size); }} className="text-xs text-red-600 underline underline-offset-4">Remove</button>
                                                    </div>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </section>

                    <aside className="w-full border border-gray-200 bg-gray-50 p-5 lg:sticky lg:top-28" aria-label="Cart summary">
                            <h2 className="text-2xl font-medium tracking-tight">Order summary</h2>
                            <div className="mt-4 w-full border-t border-gray-300 py-4">
                                <ul className="grid gap-4 text-sm text-gray-600">
                                    <li className="flex items-center justify-between">Total products:<span>{totalProducts}</span></li>
                                    <li className="flex items-center justify-between">MRP: <span>${subtotal.toFixed(1)}</span></li>
                                    <p className="h-px w-full bg-gray-300"></p>
                                    <li className="flex items-center justify-between text-base font-medium text-gray-900">Total price: <span>${subtotal.toFixed(1)}</span></li>
                                </ul>
                                {subtotal > 0 ? (
                                    <Link href="/placeOrder" className="mt-6 block w-full bg-black py-3 text-center text-sm font-semibold uppercase tracking-wider text-white transition-all duration-300 hover:bg-gray-800">Proceed to checkout</Link>
                                ) : (
                                    <button type="button" onClick={handlePay} className="mt-6 w-full cursor-pointer bg-gray-300 py-3 text-center text-sm font-semibold uppercase tracking-wider text-gray-600 transition-all duration-300 hover:bg-gray-400">Proceed to checkout</button>
                                )}
                            </div>
                    </aside>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Page