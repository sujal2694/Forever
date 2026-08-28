import React, { useState } from 'react'

const SizePopUp = () => {
    const [size, setSize] = useState('s');
    return (
        <div>
            <div className='absolute top-0 left-0 h-screen w-screen z-50 bg-zinc-800/20 flex items-center justify-center'>
                <div className='bg-white shadow-sm shadow-white/40 p-5 rounded-md max-sm:w-90 md:w-90'>
                    <h1 className='text-2xl font-semibold tracking-wide mb-3'>Select Size</h1>
                    <div className='flex items-center gap-4 mb-5'>
                        <p className={`${size === 's'? "text-white bg-black" : "border border-black bg-white text-black"} text-lg font-mono w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300`}>S</p>
                    </div>
                    <button className='w-full text-center py-2 border border-black uppercase tracking-wider font-mono bg-black text-white px-5 rounded-lg hover:bg-white hover:text-black cursor-pointer transition-all duration-300'>add to cart</button>
                </div>
            </div>
        </div>
    )
}

export default SizePopUp
