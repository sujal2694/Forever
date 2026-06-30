"use client"
import Navbar from "../components/Navbar"
import Image from "next/image"
import { assets, products } from "../assets/assets"
import { useContext, useState } from "react"
import { Context } from "../context/Context"
import Footer from "../components/Footer"

const Collection = () => {
    const { searchBar, setSearchBar, currency } = useContext(Context);
    const [category, setCategory] = useState([]);
    const [subCategory, setSubCategory] = useState([]);
    const [sortType, setSortType] = useState("relevant");
    const [search, setSearch] = useState("");

    const toggleCategory = (e) => {
        const value = e.target.value;

        if (category.includes(value)) {
            setCategory(category.filter((item) => item !== value));
        } else {
            setCategory([...category, value]);
        }
    };

    const toggleSubCategory = (e) => {
        const value = e.target.value;

        if (subCategory.includes(value)) {
            setSubCategory(subCategory.filter((item) => item !== value));
        } else {
            setSubCategory([...subCategory, value]);
        }
    };


    const filteredProducts = products.filter((item) => {

        const categoryMatch =
            category.length === 0 ||
            category.includes(item.category);

        const subCategoryMatch =
            subCategory.length === 0 ||
            subCategory.includes(item.subCategory);

        const sorted = (category.length === 0 ||
            category.includes(item.category)) &&
            (subCategory.length === 0 ||
                subCategory.includes(item.subCategory))
        
        const searchMatch =
        item.name.toLowerCase().includes(search.toLowerCase());


        return categoryMatch && subCategoryMatch && sorted && searchMatch;
    });

    if (sortType === "low-high") {
        filteredProducts.sort((a, b) => a.price - b.price);
    }

    if (sortType === "high-low") {
        filteredProducts.sort((a, b) => b.price - a.price);
    }

    return (
        <div>
            <Navbar />
            {searchBar
                ? <div>
                    <hr className="border-none bg-gray-400 h-[1] w-[85vw] lg:w-[80vw] m-auto mt-20" />
                    <div className="w-[85vw] lg:w-[80vw] m-auto flex items-center justify-center gap-4 py-5 bg-gray-300/5">
                        <div className="w-fit relative">
                            <input className="w-90 border border-gray-400 rounded-4xl p-2 pl-5" type="text" placeholder="Search products..." onChange={(e)=>setSearch(e.target.value)} />
                            <Image className="w-4 absolute right-5 top-3" src={assets.search_icon} alt="search"></Image>
                        </div>
                        <Image onClick={() => setSearchBar(false)} className="w-3 cursor-pointer" src={assets.cross_icon} alt="remove"></Image>
                    </div>
                    <hr className="border-none bg-gray-400 h-[1] w-[85vw] lg:w-[80vw] m-auto" />
                </div>
                : ""}

            <div className={`mb-20 ${searchBar ? "" : "mt-28"}`}>
                <hr className="border-none bg-gray-300 h-[1] w-[85vw] lg:w-[80vw] m-auto" />

                <div className="w-[85vw] lg:w-[80vw] m-auto mt-12 grid grid-cols-1 md:flex gap-8">
                    <div>
                        <h1 className="uppercase text-xl">filters</h1>

                        <div className="mt-6 flex items-center flex-col gap-5">
                            <div className="p-4 w-60 border border-gray-300">
                                <h3 className="uppercase text-[15px]">categories</h3>
                                <ul className="mt-3 text-sm text-gray-400 font-light tracking-wider">
                                    <li className="flex items-center gap-3">
                                        <input className="w-3" type="checkbox" value="Men" onChange={toggleCategory} />
                                        <p>Men</p>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <input className="w-3" type="checkbox" value="Women" onChange={toggleCategory} />
                                        <p>Women</p>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <input className="w-3" type="checkbox" value="Kids" onChange={toggleCategory} />
                                        <p>Kids</p>
                                    </li>
                                </ul>
                            </div>

                            <div className="p-4 w-60 border border-gray-300">
                                <h3 className="uppercase text-[15px]">type</h3>
                                <ul className="mt-3 text-sm text-gray-400 font-light tracking-wider">
                                    <li className="flex items-center gap-3">
                                        <input className="w-3" type="checkbox" value="Topwear" onChange={toggleSubCategory} />
                                        <p>Topwear</p>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <input className="w-3" type="checkbox" value="Bottomwear" onChange={toggleSubCategory} />
                                        <p>Bottomwear</p>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <input className="w-3" type="checkbox" value="Winterwear" onChange={toggleSubCategory} />
                                        <p>Winterwear</p>
                                    </li>
                                </ul>
                            </div>

                        </div>
                    </div>

                    <div className="w-full">
                        <div className="flex md:items-center md:justify-between flex-col md:flex-row w-full">
                            <h1 className="uppercase text-3xl md:text-2xl lg:text-3xl text-gray-400 flex items-center gap-2">all <span className="text-gray-600">collections</span> <hr className="border-none h-[2] bg-black rounded-4xl w-12" /></h1>

                            <select className="border-2 border-gray-300 p-2 text-sm outline-none cursor-pointer" onChange={(e) => setSortType(e.target.value)}>
                                <option value="relevant">Sort by: Relavent</option>
                                <option value="high-low">Sort by: High to Low</option>
                                <option value="low-high">Sort by: Low to High</option>
                            </select>
                        </div>

                        <div className="md:mt-4 mt-10 grid lg:grid-cols-4 md:grid-cols-3 gap-4 overflow-hidden">
                            {filteredProducts.map((item, index) => {
                                return (
                                    <div key={index} className="mb-5">
                                        <div className="overflow-hidden">
                                            <Image className="hover:scale-110 w-full transition ease-in-out cursor-pointer" src={item.image[0]} alt=""></Image>
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
