"use client";

import React, { useContext, useEffect, useState, useMemo } from "react";
import {
  CalendarDays,
  ClipboardList,
  Package,
  RefreshCw,
  Search,
} from "lucide-react";
import { Context } from "../context/Context";
import toast from "react-hot-toast";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const statuses = [
  "placed",
  "packing",
  "shipped",
  "out-for-delivery",
  "delivered",
  "cancelled",
];
const statusStyles = {
  placed: "border-sky-200 bg-sky-50 text-sky-700",
  packing: "border-amber-200 bg-amber-50 text-amber-700",
  shipped: "border-violet-200 bg-violet-50 text-violet-700",
  "out-for-delivery": "border-orange-200 bg-orange-50 text-orange-700",
  delivered: "border-emerald-200 bg-emerald-50 text-emerald-700",
  cancelled: "border-rose-200 bg-rose-50 text-rose-700",
};
const statusLabel = (status) => String(status || "placed").replaceAll("-", " ");

const OrderSkeleton = () => (
  <div className="space-y-4" aria-label="Loading orders" role="status">
    {Array.from({ length: 3 }).map((_, index) => (
      <Card key={index}>
        <CardContent className="space-y-4 p-5">
          <div className="flex justify-between">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-10 w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-6 w-20" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const Orders = () => {
  const { url } = useContext(Context);

  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const adminToken = localStorage.getItem("adminToken");
      if (!adminToken) {
        toast.error("Please login again");
        return;
      }
      const orderRes = await axios.get(url + "/api/order/admin/list-orders", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const userRes = await axios.get(url + "/api/user/list-users", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const addressRes = await axios.get(url + "/api/address/addresses", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (orderRes.data.success) setOrders(orderRes.data.orders);
      if (userRes.data.success) setUsers(userRes.data.users);
      if (addressRes.data.success) setAddresses(addressRes.data.addresses);
    } catch (error) {
      console.error("Fetch orders error:", error);
      toast.error(error.response?.data?.message || "Orders fetching failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (url) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchOrders();
    }
    // fetchOrders owns the async state updates and is intentionally invoked when the API URL is ready.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  const usersById = useMemo(() => {
    const map = {};
    users.forEach((u) => {
      map[u._id] = u;
    });
    return map;
  }, [users]);

  const addressById = useMemo(() => {
    const map = {};
    if (Array.isArray(addresses))
      addresses.forEach((a) => {
        map[a._id] = a;
      });
    return map;
  }, [addresses]);

  const handleStatusChange = async (orderId, newStatus) => {
    const adminToken = localStorage.getItem("adminToken");

    if (!adminToken) {
      toast.error("Please login again");
      return;
    }

    // Keep the previous status so we can roll back if the request fails
    const previousOrders = orders;

    // Optimistically update the UI immediately
    setOrders((prev) =>
      prev.map((order) =>
        order._id === orderId ? { ...order, status: newStatus } : order,
      ),
    );
    setUpdatingOrderId(orderId);

    try {
      const res = await axios.post(
        url + "/api/order/admin/update-status",
        { orderId, status: newStatus },
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );

      if (res.data.success) {
        toast.success("Order status updated");
      } else {
        // Roll back on a soft failure
        setOrders(previousOrders);
        toast.error(res.data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Update status error:", error);
      setOrders(previousOrders);
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        const matchesStatus =
          statusFilter === "all" || order.status === statusFilter;
        const customerName = usersById[order.userId]?.name || "";
        return (
          matchesStatus &&
          customerName.toLowerCase().includes(search.toLowerCase().trim())
        );
      }),
    [orders, search, statusFilter, usersById],
  );

  return (
    <div className="w-full pb-8 p-2">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-gray-400">
            Fulfilment
          </p>
          <h1 className="text-2xl font-medium tracking-tight">Orders</h1>
          <p className="mt-1 text-sm text-gray-500">
            {filteredOrders.length} of {orders.length} order
            {orders.length !== 1 ? "s" : ""} shown.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={fetchOrders}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={loading ? "size-4 animate-spin" : "size-4"} />
          Reload
        </Button>
      </div>
      <Card className="mb-5">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <Tabs
            value={statusFilter}
            onValueChange={setStatusFilter}
            className="w-full overflow-x-auto sm:w-auto"
          >
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              {statuses.map((status) => (
                <TabsTrigger key={status} value={status} className="capitalize">
                  {statusLabel(status)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="relative w-full sm:max-w-xs">
            <Search
              className="absolute left-3 top-2.5 size-4 text-gray-400"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search customer"
              aria-label="Search by customer name"
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {loading && orders.length === 0 ? (
        <OrderSkeleton />
      ) : filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-gray-50 text-gray-400 ring-1 ring-gray-200">
              <ClipboardList className="size-6" />
            </span>
            <div>
              <p className="font-medium text-gray-700">No orders found</p>
              <p className="mt-1 text-sm text-gray-500">
                Try another status or customer search.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const orderUser = usersById[order.userId];
            const orderAddress = addressById[order.addressId];
            const status = order.status || "placed";
            return (
              <Card key={order._id} className="overflow-hidden">
                <CardHeader className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle className="font-mono text-sm">
                      Order #{String(order._id || "").slice(-8)}
                    </CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-1.5">
                      <CalendarDays className="size-3.5" />
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : "-"}
                    </CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className={`w-fit capitalize ${statusStyles[status] || ""}`}
                  >
                    {statusLabel(status)}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-5 p-5">
                  <div className="flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-gray-50 text-gray-400">
                      <Package className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1 space-y-1">
                      {(order.items || []).map((item, index) => (
                        <p key={item._id || index} className="text-sm">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-gray-500">
                            {" "}
                            × {item.quantity} · {item.size}
                          </span>
                        </p>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">
                      {(order.items || []).length} item
                      {order.items?.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="grid gap-4 rounded-lg bg-gray-50/70 p-4 text-sm sm:grid-cols-2">
                    <div>
                      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-400">
                        Customer
                      </p>
                      <p className="font-medium text-gray-800">
                        {orderUser?.name || "Unknown user"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {orderUser?.email || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-400">
                        Deliver to
                      </p>
                      {orderAddress ? (
                        <>
                          <p className="text-gray-700">
                            {orderAddress.name}, {orderAddress.address}
                            {orderAddress.landmark
                              ? `, ${orderAddress.landmark}`
                              : ""}
                          </p>
                          <p className="text-xs text-gray-500">
                            {orderAddress.city}, {orderAddress.state} ·{" "}
                            {orderAddress.pincode}
                          </p>
                        </>
                      ) : (
                        <p className="text-gray-500">Address not found</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                      <Badge variant="secondary">
                        {order.paymentMethod || "N/A"}
                      </Badge>
                      <span className="self-center">
                        {orderAddress?.number || "No phone"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Total amount</p>
                        <p className="text-xl font-semibold tracking-tight">
                          ${Number(order.totalAmount || 0).toFixed(2)}
                        </p>
                      </div>
                      <Select
                        value={order.status}
                        disabled={updatingOrderId === order._id}
                        onValueChange={(value) =>
                          handleStatusChange(order._id, value)
                        }
                      >
                        <SelectTrigger
                          className={`h-9 w-40 capitalize ${statusStyles[status] || ""}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statuses.map((option) => (
                            <SelectItem
                              key={option}
                              value={option}
                              className="capitalize"
                            >
                              {statusLabel(option)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
