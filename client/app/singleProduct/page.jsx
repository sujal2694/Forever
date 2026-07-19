"use client"
import React, { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar'
import Image from 'next/image'
import { products } from '../assets/assets'
import Footer from '../components/Footer'
import { Context } from '../context/Context'

const Page = () => {
    const { id } = useContext(Context);
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState("");
    const [productId, setProductId] = useState(null);

    // Persist id to localStorage whenever context gives us one,
    // and fall back to the stored id if context id is empty (e.g. after refresh)
    useEffect(() => {
        if (id) {
            setProductId(id);
            localStorage.setItem('selectedProductId', id);
        } else {
            const stored = localStorage.getItem('selectedProductId');
            if (stored) setProductId(stored);
        }
    }, [id]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

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
            <div className='mt-32 w-[85vw] md:w-[95vw] lg:w-[85vw] m-auto'>
                <button
                    onClick={() => router.back()}
                    className='flex items-center gap-2 mb-6 text-md font-semibold text-zinc-700 hover:text-zinc-900 transition-colors'
                >
                    <i className='bx bx-arrow-left text-3xl'></i>
                    <p className='hover:underline underline-offset-2 text-lg cursor-pointer'>Back</p>
                </button>

                {products.map((product) => {
                    if (product._id === productId) {
                        return (
                            <div key={product._id} className='flex items-start md:flex-row lg:flex-row flex-col gap-10 w-full'>
                                <div className='w-full md:w-4/5 lg:w-1/2'>
                                    <Image className='w-full' src={product.image} alt={product.name} />
                                </div>
                                <div className='w-full md:w-2/4 pt-10'>
                                    <span className='text-sm text-gray-900/40'>{product.category} | {product.subCategory}</span>
                                    <div className='my-5'>
                                        <h1 className='text-2xl mb-1 font-semibold'>{product.name}</h1>
                                        <h3 className='font-semibold text-lg'>${product.price}</h3>
                                    </div>
                                    <p className='text-md text-gray-600'>{product.description}</p>
                                    <div className='mt-5 flex items-center justify-between'>
                                        <p className='text-md font-semibold'>Product sizes</p>
                                        <p className='text-md font-semibold underline underline-offset-2'>Size chart</p>
                                    </div>
                                    <div className='flex items-center gap-3 mt-2'>
                                        {product.sizes.map((s) => (
                                            <p
                                                key={s}
                                                onClick={() => setSelectedSize(s)}
                                                className={
                                                    selectedSize === s
                                                        ? "h-12 w-12 ring ring-zinc-900 flex items-center justify-center text-xl text-white bg-black rounded-full"
                                                        : "h-12 w-12 ring ring-zinc-500/30 flex items-center justify-center text-xl text-zinc-500 rounded-full"
                                                }
                                            >
                                                {s}
                                            </p>
                                        ))}
                                    </div>
                                    <button className='mt-10 hover:bg-transparent hover:ring ring-zinc-900 px-10 hover:text-black cursor-pointer bg-zinc-900 text-white py-2 rounded-md'>Add to Bag</button>
                                </div>
                            </div>
                        )
                    }
                })}

                <div className='md:w-[95vw] lg:w-[85vw] m-auto mt-34 mb-40'>
                    <h1 className='w-full text-center text-3xl uppercase font-semibold text-gray-500 tracking-wide flex items-center gap-3 justify-center'>
                        Other <span className='text-gray-900'>products</span>
                        <div className='w-24 h-[2px] rounded-full bg-black'></div>
                    </h1>
                    <div className='grid md:grid-cols-2 lg:grid-cols-5 grid-cols-2 gap-5 mt-5 lg:space-y-10 md:space-y-5 space-y-5 w-full pt-10'>
                        {products.slice(21, 31).map((product) => (
                            <div key={product._id}>
                                <div className='p-2 rounded-2xl hover:shadow-2xl shadow-shadow/30 hover:ring ring-zinc-500/20 hover:scale-105 transition-all duration-300'>
                                    <Image alt={product.name} src={product.image} className='rounded-2xl' />
                                    <p className='mt-5 text-md font-semibold px-3'>{product.name}</p>
                                    <p className='mt-2 px-3 tracking-wide'>${product.price}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default Page