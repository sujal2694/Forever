import React from 'react'
import Navbar from '../components/Navbar'
import Image from 'next/image'
import { assets } from '../assets/assets'
import Subscription from '../components/Subscription'
import Footer from '../components/Footer'

const Contact = () => {
    return (
        <div>
            <Navbar />
            <div className='w-[85vw] lg:w-[80vw] m-auto  mt-20'>
                <div className='text-center my-12'>
                    <h1 className='flex items-center justify-center text-2xl lg:text-3xl uppercase my-7 text-gray-400 gap-2'>contact   <span className='text-gray-800'>us</span><hr className='w-12 h-[2] bg-black border-none rounded-4xl' /></h1>
                </div>

                <div className='grid grid-cols-1 md:flex gap-10 lg:gap-5'>
                    <div className='w-fit'>
                        <Image className='w-full lg:w-xl' src={assets.contact_img} alt='contact'></Image>
                    </div>
                    <div className='w-fit'>
                        <div>
                            <h2 className='text-2xl mb-5'>Our Store</h2>
                            <p className='text-md text-gray-400 mb-5'>54709 Willms Station Suite 350, Washington, USA</p>
                            <p className='text-gray-400'>Tel: (415)555-0132</p>
                            <p className='text-gray-400 mb-10'>Email: admin@forever.com</p>
                        </div>

                        <div>
                            <h2 className='text-2xl mb-5'>Careers at Forever</h2>
                            <p className='text-gray-400 mb-8'>Learn more about our teams and job openings.</p>
                            <button className='px-8 py-3 border border-gray-700 text-sm hover:bg-black hover:text-white cursor-pointer'>Explore Jobs</button>
                        </div>
                    </div>
                </div>
                <div className='mb-16 mt-30'>
                    <Subscription />
                </div>
                <Footer/>

            </div>
        </div>
    )
}

export default Contact
