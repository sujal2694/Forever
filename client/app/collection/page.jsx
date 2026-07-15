"use client"
import Navbar from "../components/Navbar"
import Image from "next/image"
import { assets, products } from "../assets/assets"
import { useContext, useState, useEffect } from "react"
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
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 9;
    const maxVisiblePages = 3;

    const hoverColors = ["#FF85BC", "#FDBA68"];

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

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
        const searchMatch = (item.name ?? "").toLowerCase().includes((search ?? "").toLowerCase());

        return categoryMatch && subCategoryMatch && searchMatch;
    });

    if (sortType === "low-high") {
        filteredProducts.sort((a, b) => a.price - b.price);
    }

    if (sortType === "high-low") {
        filteredProducts.sort((a, b) => b.price - a.price);
    }

    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const startIndex = (currentPage - 1) * productsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

    // Sliding window of page numbers (e.g. page 2 -> [1,2,3], page 5 -> [4,5,6])
    const getVisiblePageNumbers = () => {
        let start = Math.max(1, currentPage - 1);
        let end = Math.min(start + maxVisiblePages - 1, totalPages);

        if (end - start + 1 < maxVisiblePages) {
            start = Math.max(1, end - maxVisiblePages + 1);
        }

        const pages = [];
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    const visiblePageNumbers = getVisiblePageNumbers();

    const goToPage = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

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

    useEffect(() => {
        setCurrentPage(1);
    }, [category, subCategory, search, sortType]);

    if (loading) {
        return (
            <div className="min-h-screen py-10 px-4 mt-20 fade-in">
                <Navbar />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-dashboard rounded-full animate-spin"></div>
                </div>
                <Footer />
            </div>
        );
    }

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
                            {paginatedProducts.map((item, index) => {
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
                                            <Image className="w-full transition ease-in-out cursor-pointer rounded-2xl" src={item.image} alt="" loading="eager"></Image>
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

                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-16">
                                <button
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black hover:text-white hover:border-black transition-all duration-150 cursor-pointer"
                                >
                                    <i className="bx bx-chevron-left text-lg"></i>
                                </button>

                                {visiblePageNumbers[0] > 1 && (
                                    <>
                                        <button
                                            onClick={() => goToPage(1)}
                                            className="w-9 h-9 flex items-center justify-center rounded-full text-sm border border-gray-300 hover:bg-black hover:text-white hover:border-black transition-all duration-150 cursor-pointer"
                                        >
                                            1
                                        </button>
                                        {visiblePageNumbers[0] > 2 && (
                                            <span className="w-9 h-9 flex items-center justify-center text-sm text-gray-400">...</span>
                                        )}
                                    </>
                                )}

                                {visiblePageNumbers.map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => goToPage(page)}
                                        className={`w-9 h-9 flex items-center justify-center rounded-full text-sm transition-all duration-150 cursor-pointer ${
                                            currentPage === page
                                                ? "bg-black text-white"
                                                : "border border-gray-300 hover:bg-black hover:text-white hover:border-black"
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                {visiblePageNumbers[visiblePageNumbers.length - 1] < totalPages && (
                                    <>
                                        {visiblePageNumbers[visiblePageNumbers.length - 1] < totalPages - 1 && (
                                            <span className="w-9 h-9 flex items-center justify-center text-sm text-gray-400">...</span>
                                        )}
                                        <button
                                            onClick={() => goToPage(totalPages)}
                                            className="w-9 h-9 flex items-center justify-center rounded-full text-sm border border-gray-300 hover:bg-black hover:text-white hover:border-black transition-all duration-150 cursor-pointer"
                                        >
                                            {totalPages}
                                        </button>
                                    </>
                                )}

                                <button
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black hover:text-white hover:border-black transition-all duration-150 cursor-pointer"
                                >
                                    <i className="bx bx-chevron-right text-lg"></i>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Collection