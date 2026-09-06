import React, { useContext } from 'react'
import { Context } from '../context/Context'

const Sidebar = () => {
    const { link, setLink } = useContext(Context);
    const navigation = [
        ['dashboard', 'bx-dashboard', 'Dashboard'],
        ['add', 'bx-plus-square', 'Add Product'],
        ['product-list', 'bx-list-ul', 'Product List'],
        ['orders', 'bx-package', 'Orders'],
        ['profile', 'bx-user', 'Profile'],
    ];

    return (
        <aside className='border-r border-gray-200 bg-white/70 md:w-[25vw] lg:w-[15vw] max-sm:w-[18vw]'>
            <nav aria-label='Admin navigation' className='flex flex-col items-start justify-start gap-2 mt-6 w-full px-3'>
                {navigation.map(([value, icon, label]) => (
                    <button
                        type='button'
                        key={value}
                        onClick={() => setLink(value)}
                        aria-current={link === value ? 'page' : undefined}
                        title={label}
                        className={`flex items-center justify-center gap-3 w-full py-3 cursor-pointer rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black/20 ${link === value ? "text-black bg-black/5 shadow-sm" : "text-gray-500 hover:bg-gray-100 hover:text-black"}`}
                    >
                        <i className={`bx ${icon} text-2xl`}></i>
                        <span className='max-sm:hidden block text-sm font-medium'>{label}</span>
                    </button>
                ))}
            </nav>
        </aside>
    )
}

export default Sidebar
