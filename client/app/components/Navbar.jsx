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
        <header className={`w-full py-3 fixed top-0 left-0 z-40 pt-5 ${isScrolled ? "bg-white/85 backdrop-blur-xl shadow-sm" : "bg-transparent"} transition-all duration-500`}>
            <div className="w-[85vw] max-sm:w-full max-sm:px-3 lg:w-[80vw] m-auto flex items-center justify-between">
                <div>
                    <button type="button" aria-label="Go to homepage" onClick={()=> {navMenuHandler("home"); router.push("/")}} className="rounded-md focus:outline-none focus:ring-2 focus:ring-black/30">
                        <Image className="w-40 cursor-pointer" src={assets.logo} alt="Forever homepage" loading="eager" />
                    </button>
                </div>
                <div className={`flex items-center sm:gap-6 gap-4 max-sm:hidden ${isScrolled ? "" : "px-7 py-3 rounded-full backdrop-blur-lg shadow-sm"} transition-all duration-500`}>
                    <ul className="flex items-center sm:gap-4 gap-2.5">
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
                    <ul className="flex items-center gap-7 max-sm:gap-4">
                        <Link href='/collection'><li onClick={() => { navMenuHandler("search"); setSearchBar(true) }}>
                            <Image className="w-5 cursor-pointer transition-transform hover:scale-110" src={assets.search_icon} alt="Search products" loading="eager" />
                        </li></Link>

                        {isLogedin 
                            ? <Link href='/profile'><Image onClick={() => navMenuHandler("login")} className="w-5 cursor-pointer transition-transform hover:scale-110" src={assets.profile_icon} alt="Profile" loading="eager" /></Link>
                            : <Link href='/login'><li onClick={() => navMenuHandler("login")}>
                                <button className="bg-add-button text-gray-700 hover:bg-transparent px-5 py-1 rounded-2xl text-sm hover:shadow-2xs hover:shadow-add-button cursor-pointer hover:scale-[1.1] transition-all duration-300">Log In</button>
                            </li></Link>
                        }

                        <Link href="/cart"><li onClick={() => navMenuHandler("cart")} className="relative">
                            <Image className="w-5 cursor-pointer transition-transform hover:scale-110" src={assets.cart_icon} alt="Shopping cart" loading="eager" />
                            <span className="h-4 w-4 rounded-full absolute bottom-[-5px] right-[-5px] text-gray-700 flex items-center justify-center text-[10px] font-semibold cursor-pointer bg-add-button">{Object.keys(cartItems).length}</span>
                        </li></Link>

                        <li className="hidden max-sm:block ml-5">
                            <button type="button" aria-label="Open navigation menu" aria-expanded={openSidebar} onClick={() => setOpenSidebar(true)} className="rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-black/30">
                                <Image className="w-5 max-sm:w-6 cursor-pointer" src={assets.menu_icon} alt="" />
                            </button>
                        </li>
                    </ul>
                </div>

                {/* Mobile Sidebar */}
                <div className={openSidebar ? "bg-white absolute top-0 left-0 h-screen w-full transition-all duration-300 cursor-pointer z-50" : "bg-white absolute top-0 -left-full h-screen w-full transition-all duration-300 cursor-pointer z-50"}>
                    <button type="button" aria-label="Close navigation menu" onClick={() => setOpenSidebar(false)} className="flex items-center gap-2.5 px-3 py-3 my-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-black/30">
                        <Image src={assets.dropdown_icon} className="rotate-180 w-2" alt="back-btn" loading="eager" />
                        <p className="text-gray-700">Back</p>
                    </button>
                    <hr className="border-none h-0.5 bg-gray-200" />

                    <Link href='/'><p onClick={() => { navMenuHandler("home"); setOpenSidebar(false) }} className={`flex items-center gap-4 ${menu === "home" ? "uppercase px-4 py-2 border-b-2 border-gray-200 cursor-pointer bg-primary/70 text-white" : "uppercase px-4 py-2 border-b-2 border-gray-200 cursor-pointer"}`}><i className="bx bx-home"></i> Home</p></Link>

                    <Link href='/collection'><p onClick={() => { navMenuHandler("collection"); setOpenSidebar(false) }} className={` flex items-center gap-4 ${menu === "collection" ? "uppercase px-4 py-2 border-b-2 border-gray-200 cursor-pointer bg-primary/70 text-white" : "uppercase px-4 py-2 border-b-2 border-gray-200 cursor-pointer"}`}><i className="bx bx-t-shirt"></i> Collection</p></Link>

                    <Link href='/about'><p onClick={() => { navMenuHandler("about"); setOpenSidebar(false) }} className={`flex items-center gap-4 ${menu === "about" ? "uppercase px-4 py-2 border-b-2 border-gray-200 cursor-pointer bg-primary/70 text-white" : "uppercase px-4 py-2 border-b-2 border-gray-200 cursor-pointer"}`}><i className="bx bx-info-circle"></i> About</p></Link>

                    <Link href='/contact'><p onClick={() => { navMenuHandler("contact"); setOpenSidebar(false) }} className={`flex items-center gap-4 ${menu === "contact" ? "uppercase px-4 py-2 border-b-2 border-gray-200 cursor-pointer bg-primary/70 text-white" : "uppercase px-4 py-2 border-b-2 border-gray-200 cursor-pointer"}`}><i className="bx bx-envelope"></i> Contact</p></Link>

                </div>
            </div>
        </header>
    )
}