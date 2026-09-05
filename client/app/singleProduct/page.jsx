"use client"
import React, { useContext, useEffect, useState, useSyncExternalStore } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar'
import Image from 'next/image'
import { products } from '../assets/assets'
import Footer from '../components/Footer'
import { Context } from '../context/Context'

const normalizeSizes = (value) => {
    let parsed = value;

    if (typeof value === 'string') {
        try {
            parsed = JSON.parse(value);
        } catch {
            parsed = [value];
        }
    }

    if (!Array.isArray(parsed)) return [];

    return parsed
        .map((entry) => ({
            size: typeof entry === 'string' ? entry : entry?.size,
            stock: typeof entry === 'string' || entry?.stock === undefined ? null : Number(entry.stock),
        }))
        .filter((entry) => entry.size);
};

const Page = () => {
    const { id, addToCart, url } = useContext(Context);
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [product, setProduct] = useState(null);
    const [error, setError] = useState('');
    const [selectedSize, setSelectedSize] = useState("");
    const storedProductId = useSyncExternalStore(
        () => () => {},
        () => localStorage.getItem('selectedProductId'),
        () => null
    );
    const productId = id || storedProductId;
    const sizes = normalizeSizes(product?.sizes);
    const visibleSizes = sizes.length > 0 ? sizes : ['S', 'M', 'L', 'XL'].map((size) => ({ size, stock: null }));

    useEffect(() => {
        if (id) {
            localStorage.setItem('selectedProductId', id);
        }
    }, [id]);

    useEffect(() => {
        if (!productId) return;

        const fetchProduct = async () => {
            setLoading(true);
            setError('');

            try {
                const response = await axios.get(`${url}/api/product/list-product`);
                const productsFromApi = response.data?.data || [];
                const fetchedProduct = productsFromApi.find((item) => item._id === productId);

                if (!response.data?.success || !fetchedProduct) {
                    throw new Error('Product not found.');
                }

                setProduct(fetchedProduct);
            } catch (fetchError) {
                console.error('Product fetch failed', fetchError);
                setProduct(null);
                setError(fetchError.response?.data?.message || 'Unable to load this product.');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId, url]);

    if (loading && productId) {
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
            <div className='mt-32 w-[85vw] max-sm:w-full max-sm:px-3 md:w-[95vw] lg:w-[85vw] m-auto'>
                <button
                    onClick={() => router.back()}
                    className='flex items-center gap-2 mb-6 text-md font-semibold text-zinc-700 hover:text-zinc-900 transition-colors'
                >
                    <i className='bx bx-arrow-left text-3xl'></i>
                    <p className='hover:underline underline-offset-2 text-lg cursor-pointer'>Back</p>
                </button>

                {error ? (
                    <p className='py-20 text-center text-gray-600'>{error}</p>
                ) : product ? (
                            <div key={product._id} className='flex items-start md:flex-row lg:flex-row flex-col gap-10 w-full'>
                                <div className='max-w-full md:w-4/5 lg:w-1/2'>
                                    <Image className='max-w-full h-auto' src={`${url}/images/${product.images?.[0]}`} alt={product.name} width={500} height={500} loading='eager' />
                                </div>
                                <div className='w-full md:w-2/4 pt-10'>
                                    <span className='text-sm text-gray-900/40'>{product.category} | {product.subcategory}</span>
                                    <div className='my-5'>
                                        <h1 className='text-2xl mb-1 font-semibold'>{product.name}</h1>
                                        <h3 className='font-semibold text-lg'>${product.price}</h3>
                                    </div>
                                    <p className='text-md text-gray-600'>{product.description}</p>
                                    <div className='mt-5 flex items-center justify-between'>
                                        <p className='text-md font-semibold'>Product sizes</p>
                                        <p className='text-md font-semibold underline underline-offset-2'>Size chart</p>
                                    </div>
                                    <div className='flex flex-wrap items-start gap-4 mt-3' role='group' aria-label='Available product sizes'>
                                        {visibleSizes.map(({ size, stock }) => {
                                            const isOutOfStock = stock !== null && stock <= 0;
                                            const stockLabel = isOutOfStock ? 'Out of stock' : stock !== null && stock <= 2 ? `${stock} left` : '';
                                            return (
                                                <div key={size} className='flex w-14 flex-col items-center gap-1'>
                                                    <button
                                                        type='button'
                                                        onClick={() => setSelectedSize(size)}
                                                        disabled={isOutOfStock}
                                                        aria-label={`${size}${stockLabel ? `, ${stockLabel}` : ''}`}
                                                        aria-pressed={selectedSize === size}
                                                        className={`h-12 w-12 rounded-full text-base font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 ${
                                                            selectedSize === size
                                                                ? 'bg-black text-white ring-2 ring-zinc-900'
                                                                : isOutOfStock
                                                                    ? 'cursor-not-allowed bg-zinc-100 text-zinc-300 line-through ring-1 ring-zinc-200'
                                                                    : 'text-zinc-700 ring-1 ring-zinc-400 hover:bg-zinc-900 hover:text-white'
                                                        }`}
                                                    >
                                                        {size}
                                                    </button>
                                                    {stockLabel && (
                                                        <span className={`text-center text-[10px] leading-tight ${isOutOfStock ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                                            {stockLabel}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <button onClick={()=>addToCart(productId, selectedSize)} disabled={!selectedSize} className='mt-10 hover:bg-transparent hover:ring ring-zinc-900 px-10 hover:text-black cursor-pointer bg-zinc-900 text-white py-2 rounded-md disabled:opacity-40'>Add to Bag</button>
                                </div>
                            </div>
                ) : (
                    <p className='py-20 text-center text-gray-600'>Product not found.</p>
                )}

                <div className='md:w-[95vw] lg:w-[85vw] m-auto mt-34 mb-40'>
                    <h1 className='w-full text-center text-3xl uppercase font-semibold text-gray-500 tracking-wide flex items-center gap-3 justify-center'>
                        Other <span className='text-gray-900'>products</span>
                        <div className='w-24 h-0.5 rounded-full bg-black'></div>
                    </h1>
                    <div className='grid md:grid-cols-2 lg:grid-cols-5 grid-cols-2 gap-5 mt-5 lg:space-y-10 md:space-y-5 space-y-5 w-full pt-10'>
                        {products.slice(21, 31).map((product) => (
                            <div key={product._id}>
                                <div className='p-2 rounded-2xl hover:shadow-2xl shadow-shadow/30 hover:ring ring-zinc-500/20 hover:scale-105 transition-all duration-300'>
                                    <Image alt={product.name} src={product.image} className='rounded-2xl' />
                                    <p className='mt-5 text-md font-semibold px-3'>{product.name}</p>
                                    <p className='mt-2 px-3 tracking-wide'>${product.price}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default Page