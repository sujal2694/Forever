import React, { useContext } from 'react'
import { Context } from '../context/Context'

const Sidebar = () => {
    const { link, setLink } = useContext(Context);
    return (
        <div className='border-r border-gray-400/40 md:w-[25vw] lg:w-[15vw] max-sm:w-[12vw]'>
            <ul className='flex flex-col items-start justify-start gap-5 mt-10 w-full pr-4'>
                <li onClick={() => setLink('dashboard')} className={`flex items-center justify-center gap-2 w-full py-2 cursor-pointer border transition-all duration-300 hover:bg-gray-300/30 ${link === 'dashboard' ? "text-black bg-gray-300/30 border-black" : " text-black border-gray-400"}`}>
                    <i className='bx bx-dashboard text-2xl'></i>
                    <p className='max-sm:hidden block'>Dashboard</p>
                </li>
                <li onClick={() => setLink('add')} className={`flex items-center justify-center gap-2 w-full py-2 cursor-pointer border transition-all duration-300 hover:bg-gray-300/30 ${link === 'add' ? "text-black bg-gray-300/30 border-black" : " text-black border-gray-400"}`}>
                    <i className='bx bx-plus-square text-2xl'></i>
                    <p className='max-sm:hidden block'>Add Product</p>
                </li>
                <li onClick={() => setLink('product-list')} className={`flex items-center justify-center gap-2 w-full py-2 cursor-pointer border transition-all duration-300 hover:bg-gray-300/30 ${link === 'product-list' ? "text-black bg-gray-300/30 border-black" : " text-black border-gray-400"}`}>
                    <i className='bx bx-list-ul text-2xl'></i>
                    <p className='max-sm:hidden block'>Product List</p>
                </li>
                <li onClick={() => setLink('orders')} className={`flex items-center justify-center gap-2 w-full py-2 cursor-pointer border transition-all duration-300 hover:bg-gray-300/30 ${link === 'orders' ? "text-black bg-gray-300/30 border-black" : " text-black border-gray-400"}`}>
                    <i className='bx bx-package text-2xl'></i>
                    <p className='max-sm:hidden block'>Orders</p>
                </li>
            </ul>
        </div>
    )
}

export default Sidebar
