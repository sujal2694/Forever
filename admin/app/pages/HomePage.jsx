"use client"

import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import MainContent from '../components/MainContent'

function HomePage() {
  return (
    <div className='min-h-screen flex flex-col bg-[#f7f8fa]'>
      <Navbar />
      <div className='flex flex-1 overflow-hidden'>
        <Sidebar />
        <main className='flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8'>
          <MainContent />
        </main>
      </div>
    </div>
  )
}

export default HomePage