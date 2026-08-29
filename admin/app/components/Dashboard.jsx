import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Context } from '../context/Context'
import axios from 'axios';
import { Spinner } from '@/components/ui/spinner';

const Dashboard = () => {

    const { url } = useContext(Context);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([])

    const adminToken = localStorage.getItem("adminToken")

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const productsRes = await axios.get(url + "/api/product/list-product")
            const ordersRes = await axios.get(url + "/api/order/admin/list-orders", {
                headers: { Authorization: `Bearer ${adminToken}` }
            })
            const usersRes = await axios.get(url + "/api/user/list-users")
            if (productsRes.data.success) {
                setProducts(productsRes.data.data);
            }
            if (ordersRes.data.success) {
                setOrders(ordersRes.data.orders)
            }
            if (usersRes.data.success) {
                setUsers(usersRes.data.users)
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const usersById = useMemo(() => {
        const map = {};
        users.forEach((u) => {
            map[u._id] = u;
        });
        return map;
    }, [users]);

    // Derived stats — computed from real data instead of hardcoded
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0).toFixed(1);
    const completedOrders = orders.filter(order => order.status === 'delivered').length;

    // Most recent 5 orders, newest first
    const latestOrders = [...orders]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    // Best sellers by total quantity sold across all orders
    const bestSellers = (() => {
        const salesCount = {};
        orders.forEach(order => {
            (order.items || []).forEach(item => {
                salesCount[item.name] = (salesCount[item.name] || 0) + (item.quantity || 1);
            });
        });
        return Object.entries(salesCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, qty]) => {
                const product = products.find(p => p.name === name);
                return { name, qty, product };
            });
    })();

    useEffect(() => {
        if (adminToken) {
            fetchOrders();
        }
    }, [])

    if (loading) {
        return (
            <div className='w-full flex items-center justify-center py-20'>
                <Spinner className={'size-8'} />
            </div>
        )
    }


    return (
        <div className='w-full'>
            <div>
                <h1 className='text-black font-medium text-lg tracking-wide'>Dashboard</h1>
                <p className='text-gray-400 text-sm'>An overview of the Forever store.</p>
            </div>

            <div className='mt-5 grid grid-cols-4 md:grid-cols-2 max-sm:grid-cols-1 flex-col gap-5 w-full'>
                <div className='flex-1 p-5 border border-gray-300'>
                    <div className='w-full flex items-center justify-between text-gray-500'>
                        <span className='uppercase tracking-widest text-[13px]'>total products</span>
                        <i className='bx bx-package text-xl'></i>
                    </div>
                    <p className='text-4xl mt-3 font-serif'>{products.length}</p>
                </div>
                <div className='flex-1 p-5 border border-gray-300'>
                    <div className='w-full flex items-center justify-between text-gray-500'>
                        <span className='uppercase tracking-widest text-[13px]'>orders</span>
                        <i className='bx bx-shopping-bag-alt text-xl'></i>
                    </div>
                    <p className='text-4xl mt-3 font-serif'>{(completedOrders > 0) ? (orders.length === 0) ? 0 : (orders.length - completedOrders) : orders.length}</p>
                </div>
                <div className='flex-1 p-5 border border-gray-300'>
                    <div className='w-full flex items-center justify-between text-gray-500'>
                        <span className='uppercase tracking-widest text-[13px]'>revenue</span>
                        <i className='bx bx-dollar text-xl'></i>
                    </div>
                    <p className='text-4xl mt-3 font-serif'>${totalRevenue}</p>
                </div>
                <div className='flex-1 p-5 border border-gray-300'>
                    <div className='w-full flex items-center justify-between text-gray-500'>
                        <span className='uppercase tracking-widest text-[13px]'>completed orders</span>
                        <i className='bx bx-trending-up text-xl'></i>
                    </div>
                    <p className='text-4xl mt-3 font-serif'>{completedOrders}</p>
                </div>
            </div>

            <div className='border border-gray-300 mt-5 p-5'>
                <div>
                    <h1 className='uppercase text-sm tracking-wider font-semibold'>latest orders</h1>
                </div>

                {latestOrders.length === 0 ? (
                    <p className='text-gray-400 text-sm mt-3'>No orders yet.</p>
                ) : (
                    latestOrders.map((order, index) => {
                        const orderUser = usersById[order.userId];
                        return (
                            <div key={order._id || index} className='mt-3 flex items-center justify-between'>
                                <div>
                                    <p className='text-[15px] tracking-wider'>{orderUser?.name || 'Unknown user'}</p>
                                    <span className='flex items-center gap-2 text-sm text-zinc-400'>
                                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                        <hr className='w-1 h-1 border-none bg-zinc-400 rounded-full' />
                                        {order.paymentMethod || 'N/A'}
                                    </span>
                                </div>
                                <p>${order.totalAmount}</p>
                            </div>
                        )
                    })
                )}
            </div>

            <div className='border border-gray-300 mt-5 p-5'>
                <div>
                    <h1 className='uppercase text-sm tracking-wider font-semibold'>best sellers</h1>
                </div>

                {bestSellers.length === 0 ? (
                    <p className='text-gray-400 text-sm mt-3'>No sales data yet.</p>
                ) : (
                    bestSellers.map((item, index) => (
                        <div key={index} className='mt-3 flex items-center justify-between'>
                            <div>
                                <p className='text-[15px] tracking-wider'>{item.name}</p>
                                <span className='flex items-center gap-2 text-sm text-zinc-400'>
                                    {item.product?.category || '—'}
                                    <hr className='w-1 h-1 border-none bg-zinc-400 rounded-full' />
                                    {item.product?.subcategory || '—'}
                                </span>
                            </div>
                            <p>{item.qty} sold</p>
                        </div>
                    ))
                )}

                <p className='underline underline-offset-3 uppercase text-sm mt-4 tracking-wider font-medium text-gray-700 cursor-pointer'>manage products</p>
            </div>
        </div>
    )
}

export default Dashboard