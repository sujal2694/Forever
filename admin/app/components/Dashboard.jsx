"use client"

import React, { useContext, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import axios from "axios"
import { ArrowUpRight, CalendarDays, CircleDollarSign, ClipboardList, Package, ShoppingBag, TrendingUp, Users } from "lucide-react"
import { Context } from "../context/Context"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

const statusStyles = {
    placed: "border-sky-200 bg-sky-50 text-sky-700",
    packing: "border-amber-200 bg-amber-50 text-amber-700",
    shipped: "border-violet-200 bg-violet-50 text-violet-700",
    "out-for-delivery": "border-orange-200 bg-orange-50 text-orange-700",
    delivered: "border-emerald-200 bg-emerald-50 text-emerald-700",
    cancelled: "border-rose-200 bg-rose-50 text-rose-700",
    pending: "border-gray-200 bg-gray-50 text-gray-600",
}

const formatDate = (date) => date
    ? new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "-"

const isWithinRange = (date, range) => {
    if (range === "all") return true
    const createdAt = new Date(date).getTime()
    return Number.isFinite(createdAt) && createdAt >= Date.now() - Number(range) * 24 * 60 * 60 * 1000
}

const EmptyState = ({ icon: Icon, message }) => (
    <div className="flex min-h-44 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-200 bg-gray-50/60 px-6 text-center">
        <span className="flex size-10 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm ring-1 ring-gray-200"><Icon className="size-5" aria-hidden="true" /></span>
        <p className="text-sm text-gray-500">{message}</p>
    </div>
)

const DashboardSkeleton = () => (
    <div className="w-full space-y-5" aria-label="Loading dashboard" role="status">
        <div className="space-y-2"><Skeleton className="h-6 w-32" /><Skeleton className="h-4 w-64" /></div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => <Card key={index} className="gap-4 py-5"><CardHeader className="flex flex-row justify-between px-5"><Skeleton className="h-4 w-28" /><Skeleton className="size-10 rounded-full" /></CardHeader><CardContent className="space-y-2 px-5"><Skeleton className="h-9 w-24" /><Skeleton className="h-3 w-32" /></CardContent></Card>)}
        </div>
        <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
            {[0, 1].map((panel) => <Card key={panel} className="gap-0 py-0"><CardHeader className="border-b px-5 py-5"><Skeleton className="h-5 w-36" /></CardHeader><CardContent className="space-y-4 px-5 py-5">{Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-12 w-full" />)}</CardContent></Card>)}
        </div>
    </div>
)

const Dashboard = () => {
    const { url, token: adminToken, setLink } = useContext(Context);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([])
    const [dateRange, setDateRange] = useState("all")

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const productsRes = await axios.get(url + "/api/product/list-product")
            const ordersRes = await axios.get(url + "/api/order/admin/list-orders", { headers: { Authorization: `Bearer ${adminToken}` } })
            const usersRes = await axios.get(url + "/api/user/list-users", { headers: { Authorization: `Bearer ${adminToken}` } })
            if (productsRes.data.success) setProducts(productsRes.data.data);
            if (ordersRes.data.success) setOrders(ordersRes.data.orders)
            if (usersRes.data.success) setUsers(usersRes.data.users)
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const usersById = useMemo(() => {
        const map = {};
        users.forEach((u) => { map[u._id] = u; });
        return map;
    }, [users]);

    // Derived stats — computed from real data instead of hardcoded
    const totalRevenue = orders.filter(order => order.status !== 'cancelled').reduce((sum, order) => sum + (order.totalAmount || 0), 0).toFixed(1);
    const completedOrders = orders.filter(order => order.status === 'delivered').length;

    // Most recent 5 orders, newest first
    const latestOrders = [...orders]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    // Best sellers by total quantity sold across all orders
    const bestSellers = (() => {
        const salesCount = {};
        orders.filter(order => order.status !== 'cancelled').forEach(order => {
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
            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchOrders();
        }
        // fetchOrders owns the async state updates and is intentionally invoked when the token changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [adminToken])

    if (loading) return <DashboardSkeleton />

    const recentProductCount = products.filter((product) => isWithinRange(product.createdAt, 7)).length;
    const recentOrderCount = orders.filter((order) => isWithinRange(order.createdAt, 7)).length;
    const recentCompletedCount = orders.filter((order) => order.status === "delivered" && isWithinRange(order.createdAt, 7)).length;
    const recentRevenue = orders.filter((order) => order.status !== "cancelled" && isWithinRange(order.createdAt, 7)).reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const filteredLatestOrders = latestOrders.filter((order) => isWithinRange(order.createdAt, dateRange));
    const stats = [
        { label: "Total products", value: products.length, icon: Package, tone: "bg-sky-50 text-sky-700", trend: recentProductCount ? `+${recentProductCount} this week` : null },
        { label: "Orders", value: (completedOrders > 0) ? (orders.length === 0) ? 0 : (orders.length - completedOrders) : orders.length, icon: ShoppingBag, tone: "bg-amber-50 text-amber-700", trend: recentOrderCount ? `+${recentOrderCount} this week` : null },
        { label: "Revenue", value: `$${totalRevenue}`, icon: CircleDollarSign, tone: "bg-emerald-50 text-emerald-700", trend: recentRevenue ? `+$${recentRevenue.toFixed(1)} this week` : null },
        { label: "Completed orders", value: completedOrders, icon: TrendingUp, tone: "bg-violet-50 text-violet-700", trend: recentCompletedCount ? `+${recentCompletedCount} this week` : null },
    ]

    return (
        <div className="w-full space-y-5 p-2">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-gray-400">Store overview</p>
                    <h1 className="text-2xl font-medium tracking-tight text-black">Dashboard</h1>
                    <p className="mt-1 text-sm text-gray-500">A clear view of what is happening in the Forever store.</p>
                </div>
                <Link href="/?view=product-list" onClick={() => setLink("product-list")} className="inline-flex items-center gap-2 rounded-md bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black/30">Manage products <ArrowUpRight className="size-4" aria-hidden="true" />
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map(({ label, value, icon: Icon, tone, trend }) => <Card key={label} className="gap-4 py-5">
                    <CardHeader className="flex flex-row items-start justify-between px-5">
                        <CardTitle className="text-xs font-medium uppercase tracking-[0.16em] text-gray-500">{label}
                        </CardTitle>
                        <span className={`flex size-10 items-center justify-center rounded-full ${tone}`}>
                            <Icon className="size-5" aria-hidden="true" />
                        </span>
                    </CardHeader>
                    <CardContent className="px-5">
                        <p className="text-3xl font-semibold tracking-tight text-gray-950">{value}</p>
                        {trend && <p className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-700">
                            <TrendingUp className="size-3.5" aria-hidden="true" />
                            {trend}
                        </p>}
                    </CardContent>
                </Card>)}
            </div>

            <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
                <Card className="gap-0 py-0">
                    <CardHeader className="flex flex-row items-start justify-between gap-4 border-b px-5 py-5">
                        <div>
                            <CardTitle>Latest orders</CardTitle>
                            <CardDescription className="mt-1">Recent activity across your store.</CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                            <label className="sr-only" htmlFor="order-range">Order date range</label>
                            <div className="flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs text-gray-600">
                                <CalendarDays className="size-3.5" aria-hidden="true" />
                                <select id="order-range" value={dateRange} onChange={(event) => setDateRange(event.target.value)} className="bg-transparent outline-none">
                                    <option value="all">All time</option>
                                    <option value="7">Last 7 days</option>
                                    <option value="30">Last 30 days</option>
                                </select>
                            </div>
                            <Link href="/?view=orders" onClick={() => setLink("orders")} className="hidden text-xs font-medium text-gray-600 underline-offset-4 hover:text-black hover:underline sm:inline-flex">View all orders</Link>
                        </div>
                    </CardHeader>
                    <CardContent className="px-0 py-0">
                        {filteredLatestOrders.length === 0 ? (
                            <div className="px-5 py-5">
                                <EmptyState icon={ClipboardList} message={latestOrders.length ? "No orders in this date range." : "No orders yet."} />
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="pl-5">Customer</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Payment</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="pr-5 text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredLatestOrders.map((order, index) => {
                                            const orderUser = usersById[order.userId];
                                            const status = String(order.status || "pending").toLowerCase();
                                            return (
                                                <TableRow
                                                    key={order._id || index}
                                                    onClick={() => setLink("orders")}
                                                    className="cursor-pointer transition-colors hover:bg-gray-50"
                                                >
                                                    <TableCell className="pl-5 font-medium">
                                                        <Link
                                                            href={`/?view=orders&highlight=${order._id || ""}`}
                                                            onClick={() => setLink("orders")}
                                                            className="block min-w-32"
                                                        >
                                                            {orderUser?.name || "Unknown user"}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell className="whitespace-nowrap text-gray-500">
                                                        {formatDate(order.createdAt)}
                                                    </TableCell>
                                                    <TableCell className="whitespace-nowrap text-gray-500">
                                                        {order.paymentMethod || "N/A"}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={statusStyles[status] || statusStyles.pending}>
                                                            {status.replaceAll("-", " ")}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="pr-5 text-right font-medium">
                                                        ${Number(order.totalAmount || 0).toFixed(2)}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                        <div className="border-t px-5 py-3 sm:hidden">
                            <Link href="/?view=orders" onClick={() => setLink("orders")} className="text-xs font-medium text-gray-600 underline-offset-4 hover:text-black hover:underline">
                                View all orders
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <Card className="gap-0 py-0">
                    <CardHeader className="flex flex-row items-start justify-between border-b px-5 py-5">
                        <div>
                            <CardTitle>Best sellers</CardTitle>
                            <CardDescription className="mt-1">Top products by quantity sold.</CardDescription>
                        </div>
                        <Users className="size-5 text-gray-400" aria-hidden="true" />
                    </CardHeader>
                    <CardContent className="px-5 py-5">
                        {bestSellers.length === 0 ? (
                            <EmptyState icon={Package} message="No sales data yet." />
                        ) : (
                            <div className="space-y-4">
                                {bestSellers.map((item, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <span className="w-4 text-xs font-semibold text-gray-400">{String(index + 1).padStart(2, "0")}</span>
                                        <div className="relative size-11 shrink-0 overflow-hidden rounded-md bg-gray-100 ring-1 ring-gray-200">
                                            {item.product?.images?.[0] ? (
                                                <Image
                                                    src={`${url}/images/${item.product.images[0]}`}
                                                    alt={item.name}
                                                    fill
                                                    sizes="44px"
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                            ) : (
                                                <Package className="absolute inset-0 m-auto size-5 text-gray-300" aria-hidden="true" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-gray-900">{item.name}</p>
                                            <div className="mt-1 flex gap-1.5">
                                                <Badge variant="secondary" className="max-w-28 truncate text-[10px]">
                                                    {item.product?.category || "Uncategorized"}
                                                </Badge>
                                                <Badge variant="outline" className="max-w-28 truncate text-[10px]">
                                                    {item.product?.subcategory || "-"}
                                                </Badge>
                                            </div>
                                        </div>
                                        <p className="whitespace-nowrap text-sm font-semibold text-gray-700">
                                            {item.qty} sold
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default Dashboard
