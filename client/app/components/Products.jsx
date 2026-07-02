"use client"
import { useContext } from "react";
import { products } from "../assets/assets";
import Image from "next/image";
import { Context } from "../context/Context";

export default function ProductPage() {
    const { currency } = useContext(Context);
    return (
        <div className="w-[85vw] lg:w-[80vw] m-auto my-10 fade-in">
            <div className="mb-40">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4 gap-2.5 w-full">
                        <h1 className="text-3xl uppercase text-gray-400">Latest <span className="text-gray-800">Collections</span></h1>
                        <hr className="h-0.5 w-20 bg-gray-800 border-none rounded-4xl" />
                    </div>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatibus, minus velit fugiat magni inventore reiciendis.
                    </p>
                </div>

                <div className="grid lg:grid-cols-5 md:grid-cols-3 gap-6 space-y-5 lg:space-y-10 grid-cols-1">
                    {products.slice(1, 11).map((item, index) => {
                        return (
                            <div key={index} className="w-fit hover:scale-[1.01] hover:bg-primary backdrop-blur-2xl hover:rounded-2xl hover:shadow-2xl shadow-shadow hover:p-2 lg:hover:p-3 group transition-all duration-300">
                                <div className="overflow-hidden">
                                    <Image className="rounded-2xl transition ease-in-out cursor-pointer" src={item.image[0]} alt="" loading="eager"></Image>
                                </div>
                                <p className="text-sm text-gray-600 mt-2 tracking-wide">{item.name}</p>
                                <p className="text-sm text-gray-600 mt-1">${(item.price * currency) / 20}</p>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="text-center mb-20 mt-20">
                <div className="flex items-center justify-center mb-4 gap-2.5 w-full">
                    <h1 className="text-3xl uppercase text-gray-400">best <span className="text-gray-800">sellers</span></h1>
                    <hr className="h-0.5 w-20 bg-gray-800 border-none rounded-4xl" />
                </div>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatibus, minus velit fugiat magni.
                </p>
            </div>

            <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-1 gap-6 mb-40 ">
                {products.slice(10, 14).map((item, index) => {
                    return (
                        <div key={index} className="w-fit hover:scale-[1.01] hover:bg-primary backdrop-blur-2xl hover:rounded-2xl hover:shadow-2xl shadow-shadow hover:p-2 lg:hover:p-3 group transition-all duration-300">
                            <div className="overflow-hidden">
                                <Image className="rounded-2xl transition ease-in-out cursor-pointer" src={item.image[0]} alt="" loading="eager"></Image>
                            </div>
                            <p className="text-sm text-gray-600 mt-2 tracking-wide">{item.name}</p>
                            <p className="text-sm text-gray-600 mt-1">${(item.price * currency) / 20}</p>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}