import Image from 'next/image'
import React from 'react'
import { assets } from '../assets/assets'

const Navbar = () => {
  const logout = () => {
    localStorage.removeItem('adminToken');
    window.location.reload();
  }
  return (
    <div className='flex items-center justify-between px-5 py-2 border-b border-gray-400/40'>
      <div className='flex items-end gap-3'>
        <Image src={assets.logo} alt='logo' className='w-34' loading='eager' />
        <p className='uppercase text-sm tracking-widest text-gray-500'>admin</p>
      </div>

      <button onClick={logout} className='flex items-center justify-center gap-3 cursor-pointer ring ring-black hover:bg-gray-400/10 px-4 py-2 rounded-full'>
        <p className='text-sm font-semibold  uppercase tracking-wide'>Logout</p>
      </button>
    </div>
  )
}

export default Navbar
