import React from 'react'
import Navbar from '../components/Navbar'
import Image from 'next/image'
import { assets, products } from '../assets/assets'
import Footer from '../components/Footer'

const page = () => {
    return (
        <div>
            <Navbar />
            <div className='mt-32 md:w-[95vw] lg:w-[85vw] m-auto'>
                {products.map((product) => {
                    if (product._id === "aaaaa") {
                        return (
                            <div key={product._id} className='flex items-start gap-10 w-full'>
                                <div className='w-4/5 lg:w-1/2'>
                                    <Image className='w-full' src={product.image} alt={product.name}></Image>
                                </div>
                                <div className='w-2/4 pt-10'>
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
                                        {product.sizes.map((size) => (
                                            <p key={size} className='h-10 w-10 ring ring-zinc-500/30 flex items-center justify-center text-xl text-zinc-500'>{size}</p>
                                        ))}
                                    </div>
                                    <button className='mt-5 w-full bg-zinc-900 text-white py-2 rounded-md'>Add to Bag</button>
                                </div>
                            </div>
                        )
                    }
                })}
                <div className='md:w-[95vw] lg:w-[85vw] m-auto mt-34 mb-40'>
                    <h1 className='w-full text-center text-3xl uppercase font-semibold text-gray-500 tracking-wide'>Other <span className='text-gray-900'>products</span></h1>
                    <div className='grid md:grid-cols-2 lg:grid-cols-4 grid-cols-1 gap-5 mt-5 lg:space-y-10 md:space-y-5 space-y-5'>
                        {products.slice(21, 29).map((product) => (
                            <div key={product._id}>
                                <div className='p-2 ring ring-zinc-500/30 rounded-2xl shadow-2xl shadow-shadow'>
                                    <Image alt={product.name} src={product.image} className='rounded-2xl'></Image>
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

export default page
