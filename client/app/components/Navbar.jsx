"use client"
import Image from "next/image"
import { assets } from "../assets/assets"
import { useContext, useEffect, useState } from "react"
import Link from "next/link";
import { Context } from "../context/Context";
import { useRouter } from "next/navigation";

export default function Navbar() {
    const { setSearchBar, isLogedin } = useContext(Context);
    const [menu, setMenu] = useState("home");
    const [openSidebar, setOpenSidebar] = useState(false);
    const router = useRouter();

    const navMenuHandler = (menuItem) => {
        localStorage.setItem("menu", menuItem);
        setMenu(menuItem);
    }

    useEffect(() => {
        const saved = localStorage.getItem("menu");
        if (saved) setMenu(saved);
    }, [])

    return (
        <div className="w-full py-3 fixed top-0 left-0 z-10 backdrop-blur-2xl bg-white/30 pt-5 shadow-2xl shadow-navbar">
            <div className="w-[85vw] lg:w-[80vw] m-auto flex items-center justify-between">
                <div>
                    <Image onClick={()=> {navMenuHandler("home"); router.push("/")}} className="w-40 cursor-pointer" src={assets.logo} alt="logo" priority />
                </div>
                <div className="flex items-center sm:gap-6 gap-4 max-sm:hidden">
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
                    <ul className="flex items-center gap-7">
                        <Link href='/collection'><li onClick={() => { navMenuHandler("search"); setSearchBar(true) }}>
                            <Image className="w-5 cursor-pointer" src={assets.search_icon} alt="search icon" />
                        </li></Link>

                        {isLogedin 
                            ? <Link href='/profile'><Image onClick={() => navMenuHandler("login")} className="w-5 cursor-pointer" src={assets.profile_icon} alt="profile-image" /></Link>
                            : <Link href='/login'><li onClick={() => navMenuHandler("login")}>
                                <button className="border border-gray-400/50 px-5 py-1 rounded-2xl text-sm hover:shadow-2xs hover:shadow-gray-700/50 cursor-pointer hover:scale-[1.1] transition-all duration-300">Log In</button>
                            </li></Link>
                        }

                        <Link href="/cart"><li onClick={() => navMenuHandler("cart")} className="relative">
                            <Image className="w-5 cursor-pointer" src={assets.cart_icon} alt="cart icon" />
                            <p className="bg-black h-4 w-4 rounded-full absolute bottom-[-5px] right-[-5px] text-white flex items-center justify-center text-[10px] font-semibold cursor-pointer">0</p>
                        </li></Link>

                        <li className="hidden max-sm:block">
                            <Image className="w-5 cursor-pointer" onClick={() => setOpenSidebar(true)} src={assets.menu_icon} alt="menu" />
                        </li>
                    </ul>
                </div>

                {/* Mobile Sidebar */}
                <div className={openSidebar ? "bg-white absolute top-0 left-0 h-screen w-full transition-all duration-300 cursor-pointer z-50" : "bg-white absolute top-0 -left-full h-screen w-full transition-all duration-300 cursor-pointer z-50"}>
                    <div onClick={() => setOpenSidebar(false)} className="flex items-center gap-2.5 px-3 py-1 my-2">
                        <Image src={assets.dropdown_icon} className="rotate-180 w-2" alt="back-btn" />
                        <p className="text-gray-700">Back</p>
                    </div>
                    <hr className="border-none h-0.5 bg-gray-200" />

                    <Link href='/'><p onClick={() => { navMenuHandler("home"); setOpenSidebar(false) }} className={`flex items-center gap-4 ${menu === "home" ? "uppercase px-4 py-2 border-b-2 border-gray-200 cursor-pointer bg-black text-white" : "uppercase px-4 py-2 border-b-2 border-gray-200 cursor-pointer"}`}><i className="bx bx-home"></i> Home</p></Link>

                    <Link href='/collection'><p onClick={() => { navMenuHandler("collection"); setOpenSidebar(false) }} className={` flex items-center gap-4 ${menu === "collection" ? "uppercase px-4 py-2 border-b-2 border-gray-200 cursor-pointer bg-black text-white" : "uppercase px-4 py-2 border-b-2 border-gray-200 cursor-pointer"}`}><i className="bx bx-t-shirt"></i> Collection</p></Link>

                    <Link href='/about'><p onClick={() => { navMenuHandler("about"); setOpenSidebar(false) }} className={`flex items-center gap-4 ${menu === "about" ? "uppercase px-4 py-2 border-b-2 border-gray-200 cursor-pointer bg-black text-white" : "uppercase px-4 py-2 border-b-2 border-gray-200 cursor-pointer"}`}><i className="bx bx-info-circle"></i> About</p></Link>

                    <Link href='/contact'><p onClick={() => { navMenuHandler("contact"); setOpenSidebar(false) }} className={`flex items-center gap-4 ${menu === "contact" ? "uppercase px-4 py-2 border-b-2 border-gray-200 cursor-pointer bg-black text-white" : "uppercase px-4 py-2 border-b-2 border-gray-200 cursor-pointer"}`}><i className="bx bx-envelope"></i> Contact</p></Link>

                </div>
            </div>
        </div>
    )
}