"use client"
import { useContext } from "react";
import { products } from "../frontend_assets/assets";
import Image from "next/image";
import { Context } from "../context/Context";

export default function ProductPage() {
    const {currency} = useContext(Context);
    return (
        <div className="w-[85vw] lg:w-[70vw] m-auto my-10">
            <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4 gap-2.5 w-full">
                    <h1 className="text-3xl uppercase text-gray-400">Latest <span className="text-gray-800">Collections</span></h1>
                    <hr className="h-0.5 w-20 bg-gray-800 border-none rounded-4xl" />
                </div>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatibus, minus velit fugiat magni inventore reiciendis.
                </p>
            </div>

            <div className="grid grid-cols-4 gap-4">
                {products.slice(1,11).map((item,index)=>{
                    return(
                        <div key={index} className="w-fit">
                            <div className="overflow-hidden">
                                <Image className="hover:scale-110 transition ease-in-out cursor-pointer" src={item.image[0]} alt=""></Image>
                            </div>
                            <p className="text-sm text-gray-600 mt-2 tracking-wide">{item.name}</p>
                            <p className="text-sm text-gray-600 mt-1">${(item.price * currency)/20}</p>
                        </div>
                    )
                })}
            </div>

            <div className="text-center mb-8 mt-16">
                <div className="flex items-center justify-center mb-4 gap-2.5 w-full">
                    <h1 className="text-3xl uppercase text-gray-400">best <span className="text-gray-800">sellers</span></h1>
                    <hr className="h-0.5 w-20 bg-gray-800 border-none rounded-4xl" />
                </div>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatibus, minus velit fugiat magni.
                </p>
            </div>

            <div className="grid grid-cols-4 gap-4">
                {products.slice(10,14).map((item,index)=>{
                    return(
                        <div key={index} className="w-fit">
                            <div className="overflow-hidden">
                                <Image className="hover:scale-110 transition ease-in-out cursor-pointer" src={item.image[0]} alt=""></Image>
                            </div>
                            <p className="text-sm text-gray-600 mt-2 tracking-wide">{item.name}</p>
                            <p className="text-sm text-gray-600 mt-1">${(item.price * currency)/20}</p>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}