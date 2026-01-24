"use client"
import Image from "next/image"
import { assets } from "../frontend_assets/assets"
import { useContext, useEffect, useState } from "react"
import Link from "next/link";
import { Context } from "../context/Context";

export default function Navbar() {
    const {setSearchBar} = useContext(Context);
    const [menu, setMenu] = useState("home");
    const [openSidebar, setOpenSidebar] = useState(false);
    return (
        <div className="w-full py-3">
            <div className="w-[85vw] lg:w-[80vw] m-auto flex items-center justify-between">
                <div>
                    <Image className="w-40 cursor-pointer" src={assets.logo} alt="logo"></Image>
                </div>
                <div className="flex items-center sm:gap-6 gap-4 max-sm:hidden">
                    <ul className="flex items-center sm:gap-4 gap-2.5">
                        <Link href="/"><li onClick={() => setMenu("home")} className="uppercase sm:text-sm text-gray-800 flex items-center justify-center flex-col cursor-pointer"><p>home</p><div className={menu === "home" ? "h-[1] w-5 bg-gray-800" : ""}></div></li></Link>

                        <Link href='/collection'><li onClick={() => {setMenu("collection"), setSearchBar(false)}} className="uppercase sm:text-sm text-gray-800 flex items-center justify-center flex-col cursor-pointer"><p>collection</p><div className={menu === "collection" ? "h-[1] w-5 bg-gray-800" : ""}></div></li></Link>

                        <Link href='/about'><li onClick={() => setMenu("about")} className="uppercase sm:text-sm text-gray-800 flex items-center justify-center flex-col cursor-pointer"><p>about</p><div className={menu === "about" ? "h-[1] w-5 bg-gray-800" : ""}></div></li></Link>

                        <Link href='/contact'><li onClick={() => setMenu("contact")} className="uppercase sm:text-sm text-gray-800 flex items-center justify-center flex-col cursor-pointer"><p>contact</p><div className={menu === "contact" ? "h-[1] w-5 bg-gray-800" : ""}></div></li></Link>
                    </ul>
                    <p className="border border-gray-300 rounded-3xl px-4 py-1.5 text-[12px] tracking-wider font-semibold">Admin Panel</p>
                </div>

                <div>
                    <ul className="flex items-center gap-7">
                        <Link href='/collection'><li onClick={()=>{setMenu("search"); setSearchBar(true)}}><Image className="w-5 cursor-pointer" src={assets.search_icon} alt="serach icon"></Image></li></Link>

                        <Link href='/login'><li onClick={()=>setMenu("login")}><Image className="w-5 cursor-pointer" src={assets.profile_icon} alt="profile icon"></Image></li></Link>

                        <li onClick={()=>setMenu("cart")} className="relative"><Image className="w-5 cursor-pointer" src={assets.cart_icon} alt="cart icon"></Image><p className="bg-black h-4 w-4 rounded-full absolute bottom-[-5] right-[-5] text-white flex items-center justify-center text-[10px] font-semibold cursor-pointer">0</p></li>
                        
                        <li className="hidden max-sm:block">
                            <Image className="w-5 cursor-pointer" onClick={()=>setOpenSidebar(true)} src={assets.menu_icon} alt="menu"></Image>
                        </li>
                    </ul>
                </div>

                <div className={openSidebar ? "bg-white absolute top-0 left-0 h-screen w-full transition-all duration-300 cursor-pointer" : "bg-white absolute top-0 -left-full h-screen w-full transition-all duration-300 cursor-pointer"}>
                    <div onClick={()=>setOpenSidebar(false)} className="flex items-center gap-2.5 px-3 py-1 my-2">
                        <Image src={assets.dropdown_icon} className="rotate-180 w-2" alt="back-btn"></Image>
                        <p className="text-gray-700">Back</p>
                    </div>
                    <hr className="border-none h-0.5 bg-gray-200" />
                    <Link href='/'><p onClick={()=>setMenu("home")} className={menu==="home" ? "uppercase px-4 py-2 border-b-2 border-gray-200 cursor-pointer bg-black text-white" : "uppercase px-4 py-2 border-b-2 border-gray-200 cursor-pointer"}>HOme</p></Link>

                    <Link href='/collection'><p onClick={()=>setMenu("collection")} className={menu==="collection" ? "uppercase px-4 py-2 border-b-2 border-gray-200 cursor-pointer bg-black text-white" : "uppercase px-4 py-2 border-b-2 border-gray-200 cursor-pointer"}>collection</p></Link>

                    <Link href='/about'><p onClick={()=>setMenu("about")} className={menu==="about" ? "uppercase px-4 py-2 border-b-2 border-gray-200 cursor-pointer bg-black text-white" : "uppercase px-4 py-2 border-b-2 border-gray-200 cursor-pointer"}>about</p></Link>

                    <Link href='/contact'><p onClick={()=>setMenu("contact")} className={menu==="contact" ? "uppercase px-4 py-2 border-b-2 border-gray-200 cursor-pointer bg-black text-white" : "uppercase px-4 py-2 border-b-2 border-gray-200 cursor-pointer"}>contact</p></Link>

                    <Link href='/admin'><p onClick={()=>setMenu("admin")} className={menu==="admin" ? "uppercase px-4 py-2 border-b-2 border-gray-200 cursor-pointer bg-black text-white" : "uppercase px-4 py-2 border-b-2 border-gray-200 cursor-pointer"}>admin panel</p></Link>
                </div>
            </div>
        </div>
    )
}