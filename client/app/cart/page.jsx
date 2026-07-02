import Image from "next/image"
import Navbar from "../components/Navbar"
import { products } from "../assets/assets"
import Footer from "../components/Footer"


const page = () => {

    return (
        <div>
            <Navbar />
            <div className="w-[85vw] m-auto mt-28 border-b border-gray-600/30 fade-in">
                <div className="flex items-center justify-center">
                    <h2 className="flex items-center gap-3 text-4xl uppercase text-gray-600"><span className="text-black">Your</span> Cart <p className="bg-black h-[2] w-20"></p></h2>
                </div>

                <div className="flex items-start justify-between lg:flex-row flex-col">
                    <div className="border border-gray-500/30 md:m-10 mt-10 m-2 pb-5">
                        <div>
                            <ul className="grid md:grid-cols-6 grid-cols-5 bg-zinc-400/10 text-center border-b border-gray-500/20">
                                <li className="border-r border-gray-500/10 py-2 md:block hidden">No.</li>
                                <li className="border-r border-gray-500/10 py-2">Image</li>
                                <li className="border-r border-gray-500/10 py-2">Product Name</li>
                                <li className="border-r border-gray-500/10 py-2">Price</li>
                                <li className="border-r border-gray-500/10 py-2">Quantity</li>
                                <li className="py-2">Remove</li>
                            </ul>
                        </div>

                        <div>
                            {products.map((item, index) => {
                                return (
                                    <div key={index} className="grid md:grid-cols-6 grid-cols-5 p-2 hover:bg-gray-400/10 transition-all duration-300">
                                        <p className="text-xl text-center md:block hidden">{index + 1}</p>
                                        <div className="flex justify-center">
                                            <Image className="w-20" src={item.image[0]} alt="image"></Image>
                                        </div>
                                        <p className="text-sm text-center">{item.name}</p>
                                        <p className="text-center">${item.price}</p>
                                        <p className="text-center">{index}</p>
                                        <p className="text-red-600 text-center">X</p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="flex justify-center lg:w-1/2 w-full">
                        <div className="border border-gray-600/20 w-full rounded-sm md:m-10 mt-20 mb-20 m-2 p-6 shadow shadow-gray-500/30">
                            <h2 className="text-4xl py-2">Cart Total</h2>
                            <div className="w-full border-t border-slate-500/50 py-3">
                                <ul className="text-xl font-light grid gap-4">
                                    <li className="flex items-center justify-between">Total products:<span>5</span></li>

                                    <li className="flex items-center justify-between">MRP: <span>$230</span></li>

                                    <li className="flex items-center justify-between">Discounts: <span>-$100</span></li>

                                    <p className="w-full bg-gray-700/50 h-0.5"></p>

                                    <li className="flex items-center justify-between">Total price: <span>$130</span></li>
                                </ul>
                                <div>
                                    <div className="bg-green-300/40 mt-5 text-center py-2 rounded-md text-green-700 text-lg"><i className="bx bx-discount"></i> You'll save $100 on this order!</div>
                                </div>
                                <button className="my-3 text-center w-full bg-gray-600 py-3 text-white uppercase tracking-wider font-semibold rounded-sm focus:bg-gray-600/70 transition-all duration-300 cursor-pointer">proceed to pay</button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            <Footer />
        </div>
    )
}

export default page
