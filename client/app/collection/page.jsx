"use client"
import Navbar from "../components/Navbar"
import Image from "next/image"
import { assets, products } from "../assets/assets"
import { useContext, useState } from "react"
import { Context } from "../context/Context"
import Footer from "../components/Footer"

const Collection = () => {
    const { searchBar, setSearchBar, currency, cartItems, addToCart, removeFromCart } = useContext(Context);
    const [category, setCategory] = useState([]);
    const [subCategory, setSubCategory] = useState([]);
    const [sortType, setSortType] = useState("relevant");
    const [search, setSearch] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [isSubOpen, setIsSubOpen] = useState(false);
    const [hoverBg, setHoverBg] = useState({});

    const hoverColors = ["#FF85BC", "#FDBA68"];

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
        const categoryMatch = category.length === 0 || category.includes(item.category);
        const subCategoryMatch = subCategory.length === 0 || subCategory.includes(item.subCategory);
        const searchMatch = item.name.toLowerCase().includes(search.toLowerCase());

        return categoryMatch && subCategoryMatch && searchMatch;
    });

    if (sortType === "low-high") {
        filteredProducts.sort((a, b) => a.price - b.price);
    }

    if (sortType === "high-low") {
        filteredProducts.sort((a, b) => b.price - a.price);
    }

    const handleCardHover = (itemId) => {
        const randomColor = hoverColors[Math.floor(Math.random() * hoverColors.length)];
        setHoverBg((prev) => ({ ...prev, [itemId]: randomColor }));
    };

    const handleCardLeave = (itemId) => {
        setHoverBg((prev) => {
            const nextState = { ...prev };
            delete nextState[itemId];
            return nextState;
        });
    };

    return (
        <div>
            <Navbar />
            {searchBar ? (
                <div className="fade-in">
                    <hr className="border-none bg-gray-400 h-[1] w-[85vw] lg:w-[80vw] m-auto mt-20" />
                    <div className="w-[85vw] lg:w-[80vw] m-auto flex items-center justify-center gap-4 py-5 bg-gray-300/5">
                        <div className="w-fit relative">
                            <input className="w-90 border border-gray-400 rounded-4xl p-2 pl-5" type="text" placeholder="Search products..." onChange={(e) => setSearch(e.target.value)} />
                            <Image className="w-4 absolute right-5 top-3" src={assets.search_icon} alt="search" loading="eager"></Image>
                        </div>
                        <Image onClick={() => setSearchBar(false)} className="w-3 cursor-pointer" src={assets.cross_icon} alt="remove" loading="eager"></Image>
                    </div>
                    <hr className="border-none bg-gray-400 h-[1] w-[85vw] lg:w-[80vw] m-auto" />
                </div>
            ) : ""}

            <div className={`mb-20 ${searchBar ? "" : "mt-28"} fade-in`}>
                <hr className="border-none bg-gray-300 h-[1] w-[85vw] lg:w-[80vw] m-auto" />

                <div className="w-[85vw] lg:w-[80vw] m-auto mt-12 grid grid-cols-1 md:flex gap-8 md:flex-col lg:flex-row">
                    <div>
                        <h1 className="uppercase text-xl">filters</h1>

                        <div className="mt-6 flex items-start md:flex-row lg:flex-col gap-5">
                            <div className="p-4 w-60 border border-gray-300">
                                <div onClick={() => setIsOpen(isOpen ? false : true)} className="flex items-center justify-between cursor-pointer">
                                    <h3 className="uppercase text-[15px]">categories</h3>
                                    {isOpen ? <i className="bx bx-caret-up"></i> : <i className="bx bx-caret-down"></i>}
                                </div>
                                <ul className={`mt-3 text-sm text-gray-400 font-light tracking-wider ${isOpen ? "block" : "hidden"}`}>
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
                                <div onClick={() => setIsSubOpen(isSubOpen ? false : true)} className="flex items-center justify-between cursor-pointer">
                                    <h3 className="uppercase text-[15px]">type</h3>
                                    {isSubOpen ? <i className="bx bx-caret-up"></i> : <i className="bx bx-caret-down"></i>}
                                </div>
                                <ul className={`mt-3 text-sm text-gray-400 font-light tracking-wider ${isSubOpen ? "block" : "hidden"}`}>
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
                        <div className="flex md:items-center md:justify-between flex-col md:flex-row w-full gap-5">
                            <h1 className="uppercase text-xl md:text-2xl lg:text-3xl text-gray-400 flex items-center flex-wrap gap-2">all <span className="text-gray-600">collections</span> <hr className="border-none h-[2] bg-black rounded-4xl w-12" /></h1>

                            <select className="border-2 border-gray-300 p-2 text-sm outline-none cursor-pointer" onChange={(e) => setSortType(e.target.value)}>
                                <option value="relevant">Sort by: Relavent</option>
                                <option value="high-low">Sort by: High to Low</option>
                                <option value="low-high">Sort by: Low to High</option>
                            </select>
                        </div>

                        <div className="md:mt-4 mt-10 grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-4 space-y-5">
                            {filteredProducts.map((item, index) => {
                                const quantity = cartItems[item._id] || 0;
                                return (
                                    <div
                                        key={item._id || index}
                                        onMouseEnter={() => handleCardHover(item._id)}
                                        onMouseLeave={() => handleCardLeave(item._id)}
                                        className="relative w-fit hover:scale-[1.01] backdrop-blur-2xl hover:rounded-2xl hover:shadow-2xl hover:shadow-shadow hover:p-2 lg:hover:p-3 group transition-all duration-300"
                                        style={{ backgroundColor: hoverBg[item._id] || "transparent" }}
                                    >
                                        <div className="overflow-hidden">
                                            <Image className="w-full transition ease-in-out cursor-pointer rounded-2xl" src={item.image[0]} alt="" loading="eager"></Image>
                                        </div>
                                        <div className="pl-3">
                                            <p className="text-sm text-gray-600 tracking-wide mt-2 overflow-hidden text-ellipsis whitespace-wrap">{item.name}</p>
                                            <p className="text-sm text-gray-600 mt-1">${(item.price * currency) / 20}</p>
                                        </div>
                                        <div className="absolute right-2 top-2 flex items-center justify-center gap-3 bg-pink-50 p-1 rounded-full">
                                            {quantity > 0 ? (
                                                <>
                                                    <button onClick={() => removeFromCart(item._id)} className="p-1 bg-add-button rounded-full h-7 w-7 flex items-center justify-center cursor-pointer">
                                                        <i className="bx bx-minus"></i>
                                                    </button>
                                                    <p className="font-semibold text-lg text-gray-400">{quantity}</p>
                                                    <button onClick={() => addToCart(item._id)} className="p-1 bg-add-button rounded-full h-7 w-7 flex items-center justify-center cursor-pointer">
                                                        <i className="bx bx-plus"></i>
                                                    </button>
                                                </>
                                            ) : (
                                                <button onClick={() => addToCart(item._id)} className="p-1 bg-add-button rounded-full h-7 w-7 flex items-center justify-center cursor-pointer">
                                                    <i className="bx bx-plus"></i>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Collection
