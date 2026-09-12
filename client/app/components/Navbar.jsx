"use client"
import Image from "next/image"
import { assets } from "../assets/assets"
import { useContext, useEffect, useState, useSyncExternalStore } from "react"
import Link from "next/link";
import { Context } from "../context/Context";
import { useRouter } from "next/navigation";

const subscribeToMenu = (onStoreChange) => {
    if (typeof window === "undefined") return () => {};

    window.addEventListener("storage", onStoreChange);
    window.addEventListener("menuchange", onStoreChange);
    return () => {
        window.removeEventListener("storage", onStoreChange);
        window.removeEventListener("menuchange", onStoreChange);
    };
};

const getMenuSnapshot = () => (
    typeof window === "undefined" ? "home" : localStorage.getItem("menu") || "home"
);

const getServerMenuSnapshot = () => "home";

export default function Navbar() {
    const { setSearchBar, isLogedin, cartItems } = useContext(Context);
    const menu = useSyncExternalStore(subscribeToMenu, getMenuSnapshot, getServerMenuSnapshot);
    const [openSidebar, setOpenSidebar] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const router = useRouter();

    const navMenuHandler = (menuItem) => {
        localStorage.setItem("menu", menuItem);
        window.dispatchEvent(new Event("menuchange"));
    }

    useEffect(() => {
        if (typeof window === "undefined") return;

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll();

        return () => window.removeEventListener("scroll", handleScroll);
    }, [])

    return (
        <header className={`fixed inset-x-0 top-0 z-40 w-full py-3 pt-4 sm:pt-5 ${isScrolled ? "bg-white/85 backdrop-blur-xl shadow-sm" : "bg-transparent"} transition-all duration-500`}>
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
                <div>
                    <button type="button" aria-label="Go to homepage" onClick={()=> {navMenuHandler("home"); router.push("/")}} className="rounded-md focus:outline-none focus:ring-2 focus:ring-black/30">
                        <Image className="w-28 cursor-pointer sm:w-36 lg:w-40" src={assets.logo} alt="Forever homepage" loading="eager" />
                    </button>
                </div>
                <div className={`hidden items-center gap-4 md:flex lg:gap-6 ${isScrolled ? "" : "rounded-full px-5 py-3 backdrop-blur-lg shadow-sm lg:px-7"} transition-all duration-500`}>
                    <ul className="flex items-center gap-3 lg:gap-4">
                        <Link href="/"><li onClick={() => navMenuHandler("home")} className="uppercase sm:text-sm text-gray-800 flex items-center justify-center flex-col cursor-pointer">
                            <p>home</p>
                            <div className={menu === "home" ? "h-px w-5 bg-gray-800" : ""}></div>
                        </li></Link>

                        <Link href='/collection'><li onClick={() => { navMenuHandler("collection"); setSearchBar(false) }} className="uppercase sm:text-sm text-gray-800 flex items-center justify-center flex-col cursor-pointer">
                            <p>collection</p>
                            <div className={menu === "collection" ? "h-px w-5 bg-gray-800" : ""}></div>
                        </li></Link>

                        <Link href='/about'><li onClick={() => navMenuHandler("about")} className="uppercase sm:text-sm text-gray-800 flex items-center justify-center flex-col cursor-pointer">
                            <p>about</p>
                            <div className={menu === "about" ? "h-px w-5 bg-gray-800" : ""}></div>
                        </li></Link>

                        <Link href='/contact'><li onClick={() => navMenuHandler("contact")} className="uppercase sm:text-sm text-gray-800 flex items-center justify-center flex-col cursor-pointer">
                            <p>contact</p>
                            <div className={menu === "contact" ? "h-px w-5 bg-gray-800" : ""}></div>
                        </li></Link>
                    </ul>
                </div>

                <div>
                    <ul className="flex items-center gap-4 sm:gap-5 lg:gap-7">
                        <Link href='/collection'><li onClick={() => { navMenuHandler("search"); setSearchBar(true) }}>
                            <Image className="w-5 cursor-pointer transition-transform hover:scale-110" src={assets.search_icon} alt="Search products" loading="eager" />
                        </li></Link>

                        {isLogedin 
                            ? <Link href='/profile'><Image onClick={() => navMenuHandler("login")} className="w-5 cursor-pointer transition-transform hover:scale-110" src={assets.profile_icon} alt="Profile" loading="eager" /></Link>
                            : <Link href='/login'><li onClick={() => navMenuHandler("login")}>
                                <button className="cursor-pointer rounded-2xl bg-add-button px-3 py-1 text-xs text-gray-700 transition-all duration-300 hover:bg-transparent hover:shadow-2xs hover:shadow-add-button sm:px-5 sm:text-sm">Log In</button>
                            </li></Link>
                        }

                        <Link href="/cart"><li onClick={() => navMenuHandler("cart")} className="relative">
                            <Image className="w-5 cursor-pointer transition-transform hover:scale-110" src={assets.cart_icon} alt="Shopping cart" loading="eager" />
                            <span className="absolute -bottom-1.25 -right-1.25 flex h-4 w-4 cursor-pointer items-center justify-center rounded-full bg-add-button text-[10px] font-semibold text-gray-700">{Object.keys(cartItems).length}</span>
                        </li></Link>

                        <li className="ml-1 md:hidden">
                            <button type="button" aria-label="Open navigation menu" aria-expanded={openSidebar} onClick={() => setOpenSidebar(true)} className="rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-black/30">
                                <Image className="w-5 max-sm:w-6 cursor-pointer" src={assets.menu_icon} alt="" />
                            </button>
                        </li>
                    </ul>
                </div>

                {/* Mobile Sidebar */}
                {openSidebar && <button type="button" aria-label="Close navigation menu" onClick={() => setOpenSidebar(false)} className="fixed inset-0 z-40 cursor-default bg-black/20 md:hidden" />}
                <div className={`fixed inset-y-0 right-0 z-50 h-screen w-[min(86vw,22rem)] overflow-y-auto bg-white shadow-xl transition-transform duration-300 md:hidden ${openSidebar ? "translate-x-0" : "translate-x-full"}`}>
                    <button type="button" aria-label="Close navigation menu" onClick={() => setOpenSidebar(false)} className="my-2 flex items-center gap-2.5 px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-black/30">
                        <Image src={assets.dropdown_icon} className="rotate-180 w-2" alt="back-btn" loading="eager" />
                        <p className="text-gray-700">Back</p>
                    </button>
                    <hr className="border-none h-0.5 bg-gray-200" />

                    <Link href='/'><p onClick={() => { navMenuHandler("home"); setOpenSidebar(false) }} className={`flex items-center gap-4 ${menu === "home" ? "uppercase px-4 py-3 border-b-2 border-gray-200 cursor-pointer bg-primary/70 text-white" : "uppercase px-4 py-3 border-b-2 border-gray-200 cursor-pointer"}`}><i className="bx bx-home"></i> Home</p></Link>

                    <Link href='/collection'><p onClick={() => { navMenuHandler("collection"); setOpenSidebar(false) }} className={`flex items-center gap-4 ${menu === "collection" ? "uppercase px-4 py-3 border-b-2 border-gray-200 cursor-pointer bg-primary/70 text-white" : "uppercase px-4 py-3 border-b-2 border-gray-200 cursor-pointer"}`}><i className="bx bx-t-shirt"></i> Collection</p></Link>

                    <Link href='/about'><p onClick={() => { navMenuHandler("about"); setOpenSidebar(false) }} className={`flex items-center gap-4 ${menu === "about" ? "uppercase px-4 py-3 border-b-2 border-gray-200 cursor-pointer bg-primary/70 text-white" : "uppercase px-4 py-3 border-b-2 border-gray-200 cursor-pointer"}`}><i className="bx bx-info-circle"></i> About</p></Link>

                    <Link href='/contact'><p onClick={() => { navMenuHandler("contact"); setOpenSidebar(false) }} className={`flex items-center gap-4 ${menu === "contact" ? "uppercase px-4 py-3 border-b-2 border-gray-200 cursor-pointer bg-primary/70 text-white" : "uppercase px-4 py-3 border-b-2 border-gray-200 cursor-pointer"}`}><i className="bx bx-envelope"></i> Contact</p></Link>

                </div>
            </div>
        </header>
    )
}