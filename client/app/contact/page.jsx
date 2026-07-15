"use client"
import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Image from 'next/image'
import { assets } from '../assets/assets'
import Subscription from '../components/Subscription'
import Footer from '../components/Footer'

const Contact = () => {
    const [loading, setLoading] = useState(true);

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
            <div className='w-[85vw] lg:w-[80vw] m-auto  mt-28 fade-in'>
                <div className='text-center my-12'>
                    <h1 className='flex items-center justify-center text-2xl lg:text-3xl uppercase my-7 text-gray-400 gap-2'>contact   <span className='text-gray-800'>us</span><hr className='w-12 h-[2] bg-black border-none rounded-4xl' /></h1>
                </div>

                <div className='md:flex gap-10 lg:gap-5'>
                    <div className='w-full lg:w-1/2'>
                        <Image className='min-w-full lg:w-xl' src={assets.contact_img} alt='contact' loading='eager'></Image>
                        <div className='leading-5 mt-4'>
                            <h2 className='text-2xl mb-5'>Our Store</h2>
                            <p className='text-md text-gray-400'>54709 Willms Station Suite 350, Washington, USA</p>
                            <p className='text-gray-400'>Tel: (415)555-0132</p>
                            <p className='text-gray-400'>Email: admin@forever.com</p>
                        </div>
                    </div>
                    <div className='bg-gray-500/40 min-h-full w-[1px]'></div>
                    <div className='w-1/2 min-h-full flex items-center mt-20 lg:mt-0 pl-10'>
                        <form className='flex items-start justify-start flex-col gap-8'>
                            <div className='flex flex-col gap-1 text-md font-serif tracking-wide w-full'>
                                <label htmlFor="first-name">First name</label>
                                <input type="text" placeholder='Type here' className='ring ring-gray-400 h-10 w-full rounded-md px-3 py-1' />
                            </div>
                            <div className='flex flex-col gap-1 text-md font-serif tracking-wide w-full'>
                                <label htmlFor="last-name">Last name</label>
                                <input type="text" placeholder='Type here' className='ring ring-gray-400 h-10 w-full rounded-md px-3 py-1' />
                            </div>
                            <div className='flex flex-col gap-1 text-md font-serif tracking-wide w-full'>
                                <label htmlFor="phone">Phone</label>
                                <input type="text" placeholder='Type here' className='ring ring-gray-400 h-10 w-full rounded-md px-3 py-1' />
                            </div>
                            <div className='flex flex-col gap-1 text-md font-serif tracking-wide w-full'>
                                <label htmlFor="email">E-mail</label>
                                <input type="email" placeholder='Type here' className='ring ring-gray-400 h-10 w-full rounded-md px-3 py-1' />
                            </div>
                            <div className='flex flex-col gap-1 text-md font-serif tracking-wide'>
                                <label htmlFor="message">Message</label>
                                <textarea rows={5} cols={40} placeholder='Type here' className='ring ring-gray-400 rounded-md px-3 py-1'></textarea>
                            </div>
                            <button type='submit' className='bg-black text-white px-5 py-2 hover:shadow-button shadow-zinc-900/80 hover:bg-transparent hover:text-black transition-all duration-300 cursor-pointer'>Send</button>
                        </form>
                    </div>
                </div>
                <div className='mb-16 mt-30'>
                    <Subscription />
                </div>
                <Footer />

            </div>
        </div>
    )
}

export default Contact
