import Image from 'next/image'
import React from 'react'
import { assets } from '../assets/assets'

const Navbar = () => {
  const logout = () => {
    localStorage.removeItem('adminToken');
    window.location.reload();
  }
  return (
    <header className='sticky top-0 z-30 flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-white/90 backdrop-blur-xl'>
      <div className='flex items-end gap-3'>
        <Image src={assets.logo} alt='logo' className='w-34' loading='eager' />
        <p className='uppercase text-sm tracking-widest text-gray-500'>admin</p>
      </div>

      <button type='button' onClick={logout} className='flex items-center justify-center gap-2 cursor-pointer border border-gray-300 hover:border-black hover:bg-black hover:text-white px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-black/20'>
        <p className='text-sm font-semibold  uppercase tracking-wide'>Logout</p>
      </button>
    </header>
  )
}

export default Navbar
