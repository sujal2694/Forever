import React, { useContext, useEffect, useState, useMemo } from 'react'
import { Context } from '../context/Context'
import { Spinner } from '@/components/ui/spinner';
import axios from 'axios';
import toast from 'react-hot-toast';
import Image from 'next/image';

const ProductList = () => {
    const { url } = useContext(Context);
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState("men")
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const handleFetchProducts = async () => {
        try {
            setLoading(true)
            const response = await axios.get(url + '/api/product/list-product');

            if (response.data.success) {
                setProducts(response.data.data);
            } else {
                toast.error(response.data.message || "Failed to load products.")
            }
        } catch (error) {
            console.log(error);
            toast.error("Products fetch failed.")
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        handleFetchProducts();
    }, [url])

    const filterProducts = useMemo(() => {
        return products.filter(
            (p) => (p.category || "").toLowerCase() === category
        );
    }, [products, category]);

    const handleDelete = async (productId) => {
        const adminToken = localStorage.getItem("adminToken");

        if (!adminToken) {
            toast.error("Please login again");
            return;
        }

        setDeletingId(productId);

        try {
            const res = await axios.post(
                url + "/api/product/remove-product",
                { id: productId },
                { headers: { Authorization: `Bearer ${adminToken}` } }
            );

            if (res.data.success) {
                setProducts((prev) => prev.filter((p) => p._id !== productId));
                toast.success("Product removed");
            } else {
                toast.error(res.data.message || "Failed to remove product");
            }
        } catch (error) {
            console.log(error);
            toast.error("Failed to remove product");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div>
            <div>
                <h1 className='text-black font-medium text-lg tracking-wide'>All Product List</h1>
                <p className='text-gray-400 text-sm'>
                    {filterProducts.length} item{filterProducts.length !== 1 ? 's' : ''} in the catalogue.
                </p>
                <p className='text-sm mt-3 text-gray-400 tracking-widest'>Total Products: {products.length}</p>
            </div>

            <div className='mt-5'>
                <h1 className='mb-3 text-lg font-mono'>Category</h1>
                <div>
                    <ul className='flex items-center justify-start gap-5'>
                        <li onClick={() => setCategory("men")} className={category === 'men' ? 'bg-black text-white text-center px-4 py-2 rounded-sm cursor-pointer font-mono' : 'border border-gray-300 rounded-sm text-center px-4 py-2 font-mono tracking-wide cursor-pointer'}>Men</li>
                        <li onClick={() => setCategory("women")} className={category === 'women' ? 'bg-black text-white text-center px-4 py-2 rounded-sm cursor-pointer font-mono' : 'border border-gray-300 rounded-sm text-center px-4 py-2 font-mono tracking-wide cursor-pointer'}>Women</li>
                        <li onClick={() => setCategory("kids")} className={category === 'kids' ? 'bg-black text-white text-center px-4 py-2 rounded-sm cursor-pointer font-mono' : 'border border-gray-300 rounded-sm text-center px-4 py-2 font-mono tracking-wide cursor-pointer'}>Kids</li>
                    </ul>
                </div>
            </div>

            {loading ? (
                <div className='flex items-center justify-center mt-20'>
                    <Spinner className='size-8' />
                </div>
            ) : filterProducts.length === 0 ? (
                <div className='flex items-center justify-center mt-20'>
                    <p className='text-gray-400 text-sm'>No products in this category.</p>
                </div>
            ) : (
                <div className='mt-5 flex flex-col gap-3'>
                    {filterProducts.map((p) => (
                        <div key={p._id} className='flex items-center justify-between px-5 py-3 border border-gray-300'>
                            <div className={`bg-gray-400/30 ${p.images?.length > 0 ? "" : "p-2"} flex items-center justify-center shrink-0 w-[76px] h-[76px] overflow-hidden`}>
                                {p.images?.[0] ? (
                                    <Image
                                        src={`${url}/images/${p.images[0]}`}
                                        width={60}
                                        height={60}
                                        alt={p.name}
                                        className='object-cover w-full h-full'
                                        unoptimized
                                    />
                                ) : (
                                    <span className='text-[10px] text-gray-400'>No image</span>
                                )}
                            </div>

                            <div className='flex items-start flex-col flex-1 ml-4'>
                                <h2 className='text-md tracking-wider tracking-wide font-medium'>{p.name}</h2>
                                <div className='text-xs tracking-wide text-gray-500 flex items-center gap-1 flex-wrap'>
                                    <span className='capitalize'>{p.subcategory}</span>
                                    <hr className='bg-gray-400/60 border-none h-1 w-1 rounded-full' />
                                    <span>{p.sizes?.join(', ')}</span>
                                    {p.bestseller && (
                                        <>
                                            <hr className='bg-gray-400/60 border-none h-1 w-1 rounded-full' />
                                            <span>Bestseller</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className='flex items-center gap-4 shrink-0 max-sm:hidden'>
                                <p className='text-md tracking-wide uppercase text-gray-500'>{p.category}</p>
                            </div>

                            <button
                                onClick={() => handleDelete(p._id)}
                                disabled={deletingId === p._id}
                                className='m-3 p-2 flex items-center justify-center border border-red-500 rounded-sm bg-red-50 cursor-pointer disabled:opacity-50'
                            >
                                <i className='bx bx-trash text-md text-red-600'></i>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ProductList