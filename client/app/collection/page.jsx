"use client"
import Navbar from "../components/Navbar"
import Image from "next/image"
import { assets, products } from "../frontend_assets/assets"
import { useContext, useState } from "react"
import { Context } from "../context/Context"
import Footer from "../components/Footer"

const Collection = () => {
    const { searchBar, setSearchBar, currency } = useContext(Context);

    return (
        <div>
            <Navbar />
            {searchBar
                ? <div>
                    <hr className="border-none bg-gray-400 h-[1] w-[85vw] lg:w-[80vw] m-auto" />
                    <div className="w-[85vw] lg:w-[80vw] m-auto flex items-center justify-center gap-4 py-5 bg-gray-400/10">
                        <div className="w-fit relative">
                            <input className="w-90 border border-gray-400 rounded-4xl p-2 pl-5" type="text" placeholder="Search" />
                            <Image className="w-4 absolute right-5 top-3" src={assets.search_icon} alt="search"></Image>
                        </div>
                        <Image onClick={() => setSearchBar(false)} className="w-3 cursor-pointer" src={assets.cross_icon} alt="remove"></Image>
                    </div>
                    <hr className="border-none bg-gray-400 h-[1] w-[85vw] lg:w-[80vw] m-auto" />
                </div>
                : ""}

            <div className="mb-20">
                <hr className="border-none bg-gray-300 h-[1] w-[85vw] lg:w-[80vw] m-auto" />

                <div className="w-[85vw] lg:w-[80vw] m-auto mt-12 flex items-start gap-8">
                    <div>
                        <h1 className="uppercase text-xl">filters</h1>

                        <div className="mt-6 flex items-center flex-col gap-5">
                            <div className="p-4 w-60 border border-gray-300">
                                <h3 className="uppercase text-[15px]">categories</h3>
                                <ul className="mt-3 text-sm text-gray-400 font-light tracking-wider">
                                    <li className="flex items-center gap-3">
                                        <input className="w-3" type="checkbox" />
                                        <p>Men</p>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <input className="w-3" type="checkbox" />
                                        <p>Women</p>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <input className="w-3" type="checkbox" />
                                        <p>Kids</p>
                                    </li>
                                </ul>
                            </div>

                            <div className="p-4 w-60 border border-gray-300">
                                <h3 className="uppercase text-[15px]">type</h3>
                                <ul className="mt-3 text-sm text-gray-400 font-light tracking-wider">
                                    <li className="flex items-center gap-3">
                                        <input className="w-3" type="checkbox" />
                                        <p>Topwear</p>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <input className="w-3" type="checkbox" />
                                        <p>Bottomwear</p>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <input className="w-3" type="checkbox" />
                                        <p>Winterwear</p>
                                    </li>
                                </ul>
                            </div>

                        </div>
                    </div>

                    <div className="w-full">
                        <div className="flex items-center justify-between w-full">
                            <h1 className="uppercase text-2xl lg:text-3xl text-gray-400 flex items-center gap-2">all <span className="text-gray-600">collections</span> <hr className="border-none h-[2] bg-black rounded-4xl w-12" /></h1>

                            <select className="border-2 border-gray-300 p-2 text-sm outline-none cursor-pointer">
                                <option value="Sort by: Relavent">Sort by: Relavent</option>
                                <option value="Sort by: High to Low">Sort by: High to Low</option>
                                <option value="Sort by: Low to High">Sort by: Low to High</option>
                            </select>
                        </div>

                        <div className="mt-4 grid lg:grid-cols-4 md:grid-cols-3 gap-4">
                            {products.slice(1).map((item, index) => {
                                return (
                                    <div key={index} className="mb-5">
                                        <div className="overflow-hidden">
                                            <Image className="hover:scale-110 transition ease-in-out cursor-pointer" src={item.image[0]} alt=""></Image>
                                        </div>
                                        <div className="pl-3">
                                            <p className="text-sm text-gray-600 tracking-wide mt-2">{item.name}</p>
                                            <p className="text-sm text-gray-600 mt-1">${(item.price * currency) / 20}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default Collection
