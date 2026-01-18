import React from 'react'
import Navbar from '../components/Navbar'
import Image from 'next/image'
import { assets } from '../frontend_assets/assets'
import Subscripation from '../components/Subscripation'
import Footer from '../components/Footer'

const Contact = () => {
    return (
        <div>
            <Navbar />
            <hr className='h-[1] w-[85vw] lg:w-[70vw] m-auto bg-gray-300 border-none' />
            <div className='w-[85vw] lg:w-[70vw] m-auto'>
                <div className='text-center'>
                    <h1 className='flex items-center justify-center text-2xl lg:text-3xl uppercase my-7 text-gray-400 gap-2'>contact   <span className='text-gray-800'>us</span><hr className='w-12 h-[2] bg-black border-none rounded-4xl' /></h1>
                </div>

                <div className='flex items-center gap-10'>
                    <div className='w-full'>
                        <Image className='w-full' src={assets.contact_img} alt='contact'></Image>
                    </div>
                    <div className='w-1/2'>
                        <div>
                            <h2 className='text-2xl mb-5'>Our Store</h2>
                            <p className='text-md text-gray-400 mb-5'>54709 Willms Station Suite 350, Washington, USA</p>
                            <p className='text-gray-400'>Tel: (415)555-0132</p>
                            <p className='text-gray-400 mb-10'>Email: admin@forever.com</p>
                        </div>

                        <div>
                            <h2 className='text-2xl mb-5'>Careers at Forever</h2>
                            <p className='text-gray-400 mb-8'>Learn more about our teams and job openings.</p>
                            <button className='px-8 py-3 border border-gray-700 text-sm'>Explore Jobs</button>
                        </div>
                    </div>
                </div>
                <div className='mb-16 mt-30'>
                    <Subscripation />
                </div>
                <Footer/>

            </div>
        </div>
    )
}

export default Contact
