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
            <main className='mx-auto mt-28 w-full max-w-7xl px-4 pb-12 sm:px-6 lg:px-8'>
                <button
                    onClick={() => router.back()}
                    className='flex items-center gap-2 mb-6 text-md font-semibold text-zinc-700 hover:text-zinc-900 transition-colors'
                >
                    <i className='bx bx-arrow-left text-3xl'></i>
                    <p className='hover:underline underline-offset-2 text-lg cursor-pointer'>Back</p>
                </button>

                {error ? (
                    <div className='mx-auto max-w-xl py-20 text-center'>
                        <p className='text-lg font-medium text-gray-900'>{error}</p>
                        <button type='button' onClick={() => router.back()} className='mt-5 border border-gray-300 px-5 py-2 text-sm hover:border-black'>Return to collection</button>
                    </div>
                ) : product ? (
                            <div key={product._id} className='grid w-full gap-10 lg:grid-cols-2 lg:gap-20'>
                                <div className='aspect-square w-full overflow-hidden bg-gray-100'>
                                    <Image className='h-full w-full object-cover' src={`${url}/images/${product.images?.[0]}`} alt={product.name} width={700} height={700} loading='eager' unoptimized />
                                </div>
                                <div className='flex w-full flex-col justify-center'>
                                    <span className='text-sm text-gray-900/40'>{product.category} | {product.subcategory}</span>
                                    <div className='my-5'>
                                        <h1 className='text-2xl mb-1 font-semibold'>{product.name}</h1>
                                        <h3 className='font-semibold text-lg'>${product.price}</h3>
                                    </div>
                                    <p className='text-md text-gray-600'>{product.description}</p>
                                    <div className='mt-8 flex items-center justify-between gap-4'>
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
                                    <button onClick={()=>addToCart(productId, selectedSize)} disabled={!selectedSize} className='mt-10 w-full cursor-pointer bg-zinc-900 px-10 py-3 text-sm font-medium uppercase tracking-wider text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40 sm:w-fit'>Add to Bag</button>
                                </div>
                            </div>
                ) : (
                    <p className='py-20 text-center text-gray-600'>Product not found.</p>
                )}

                <div className='mx-auto mb-24 mt-24 w-full max-w-7xl'>
                    <h1 className='w-full text-center text-3xl uppercase font-semibold text-gray-500 tracking-wide flex items-center gap-3 justify-center'>
                        Other <span className='text-gray-900'>products</span>
                        <div className='w-24 h-0.5 rounded-full bg-black'></div>
                    </h1>
                    <div className='grid w-full grid-cols-2 gap-4 pt-8 sm:grid-cols-3 lg:grid-cols-5'>
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
            </main>
            <Footer />
        </div>
    )
}

export default Page