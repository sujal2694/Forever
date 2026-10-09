"use client"
import axios from "axios";
import { createContext, useEffect, useState, useSyncExternalStore } from "react";
import SizePopUp from "../components/SizePopUp";
import { toast } from "react-toastify";

export const Context = createContext();

const subscribeToToken = (onStoreChange) => {
    if (typeof window === "undefined") return () => {};

    window.addEventListener("storage", onStoreChange);
    window.addEventListener("tokenchange", onStoreChange);
    return () => {
        window.removeEventListener("storage", onStoreChange);
        window.removeEventListener("tokenchange", onStoreChange);
    };
};

const getTokenSnapshot = () => (
    typeof window === "undefined" ? "" : localStorage.getItem("token") || ""
);

const getServerTokenSnapshot = () => "";

const normalizeProductSizes = (value) => {
    let parsed = value;

    if (typeof value === "string") {
        try {
            parsed = JSON.parse(value);
        } catch {
            parsed = [value];
        }
    }

    if (!Array.isArray(parsed)) return [];

    return parsed
        .map((entry) => ({
            size: String(typeof entry === "string" ? entry : entry?.size || "").trim().toUpperCase(),
            stock: typeof entry === "string" || entry?.stock === undefined ? null : Number(entry.stock),
        }))
        .filter((entry) => entry.size);
};

export const ContextProvider = ({ children }) => {
    const [searchBar, setSearchBar] = useState(true);
    const currency = 86;
    const url = "https://forever-backend-cywq.onrender.com";
    // const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const [cartItems, setCartItems] = useState({}); // { itemId: { size: qty } }
    const [productList, setProductList] = useState([]);
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);
    const token = useSyncExternalStore(subscribeToToken, getTokenSnapshot, getServerTokenSnapshot);
    const setToken = (nextToken) => {
        if (typeof window === "undefined") return;

        const resolvedToken = typeof nextToken === "function" ? nextToken(token) : nextToken;
        if (resolvedToken) {
            localStorage.setItem("token", resolvedToken);
        } else {
            localStorage.removeItem("token");
        }
        window.dispatchEvent(new Event("tokenchange"));
    };
    const [dashboardLink, setDashboardLink] = useState("Dashboard");
    const [id, setId] = useState("");
    const [sizePopupItemId, setSizePopupItemId] = useState(null); // controls the popup

    const openSizePopup = (itemId) => setSizePopupItemId(itemId);
    const closeSizePopup = () => setSizePopupItemId(null);

    const addToCart = async (itemId, size) => {
        // No size given -> open the popup and stop, don't add yet
        if (!size) {
            openSizePopup(itemId);
            return;
        }

        const normalizedSize = String(typeof size === "object" ? size?.size : size).trim().toUpperCase();
        if (!normalizedSize) {
            toast.error("Please select a size.");
            return;
        }
        let product = productList.find((item) => String(item._id) === String(itemId));
        if (!product) {
            try {
                const response = await axios.get(`${url}/api/product/list-product`);
                product = (response.data?.data || []).find((item) => String(item._id) === String(itemId));
                if (product) setProductList((currentProducts) => {
                    const existingIndex = currentProducts.findIndex((item) => String(item._id) === String(itemId));
                    if (existingIndex === -1) return [...currentProducts, product];
                    const nextProducts = [...currentProducts];
                    nextProducts[existingIndex] = product;
                    return nextProducts;
                });
            } catch {
                toast.error("Products are still loading. Please try again.");
                return;
            }
        }

        const sizeRecord = normalizeProductSizes(product?.sizes).find((entry) => entry.size === normalizedSize);
        if (!sizeRecord) {
            toast.error("That size is not available for this product.");
            return;
        }

        const localSizes = cartItems[itemId] || {};
        const localSizeKey = Object.keys(localSizes).find((key) => key.toUpperCase() === normalizedSize);
        const currentQuantity = localSizeKey ? Number(localSizes[localSizeKey]) || 0 : 0;
        if (sizeRecord.stock !== null && currentQuantity >= Number(sizeRecord.stock || 0)) {
            toast.error("This size is out of stock.");
            return;
        }

        closeSizePopup();

        try {
            if (token) {
                await axios.post(
                    `${url}/api/cart/add-to-cart`,
                    { itemId, size: normalizedSize },
                    { headers: { token } }
                );
            }

            setCartItems((prev) => {
                const sizes = { ...(prev[itemId] || {}) };
                sizes[normalizedSize] = (sizes[normalizedSize] || 0) + 1;
                return { ...prev, [itemId]: sizes };
            });
            toast.success("Item added to cart");
        } catch (error) {
            if (![400, 409].includes(error.response?.status)) {
                console.error("Add to cart failed", error);
            }
            if (token) await fetchCartData(token);
            toast.error(error.response?.data?.message || "Unable to add this item to your cart.");
        }
    };

    const removeFromCart = async (itemId, size) => {
        try {
            if (token) {
                await axios.post(
                    `${url}/api/cart/remove-from-cart`,
                    { itemId, size },
                    { headers: { token } }
                );
            }

            setCartItems((prev) => {
                const sizes = { ...(prev[itemId] || {}) };
                const normalizedSize = String(size).toUpperCase();
                if (!sizes[normalizedSize]) return prev;

                sizes[normalizedSize] = Math.max(0, sizes[normalizedSize] - 1);
                if (sizes[normalizedSize] === 0) delete sizes[normalizedSize];

                const next = { ...prev };
                if (Object.keys(sizes).length === 0) delete next[itemId];
                else next[itemId] = sizes;
                return next;
            });
            toast.success("Item removed from cart");
        } catch (error) {
            console.error("Remove from cart failed", error);
            if (token) await fetchCartData(token);
            toast.error(error.response?.data?.message || "Unable to remove this item from your cart.");
        }
    };

    // total quantity for an item across all its sizes (for the card badge)
    const getItemTotalQty = (itemId) => {
        const sizes = cartItems[itemId];
        if (!sizes) return 0;
        return Object.values(sizes).reduce((sum, qty) => sum + qty, 0);
    };

    const getTotalCartAmt = () => {
        let totalAmt = 0;
        Object.entries(cartItems).forEach(([itemId, sizes]) => {
            const itemInfo = productList.find((product) => product._id === itemId);
            if (!itemInfo) return;
            Object.values(sizes).forEach((qty) => {
                if (qty > 0) totalAmt += itemInfo.price * qty;
            });
        });
        return totalAmt;
    };

    const fetchCartData = async (userToken = token) => {
        if (!userToken) return;
        try {
            const response = await axios.post(
                `${url}/api/cart/get-cart`,
                {},
                { headers: { token: userToken } }
            );
            if (response.data?.success) {
                setCartItems(response.data.cartData || {});
            }
        } catch (error) {
            console.error("Cart fetch failed", error);
            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                setToken("");
            }
        }
    };

    const fetchUserId = async () => {
        try {
            const currentToken = localStorage.getItem("token");
            const currentUser = await axios.get(url + '/api/user/profile', { headers: { token: currentToken } });
            return currentUser.data?.user?._id;
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        let cancelled = false;

        const loadProducts = async () => {
            try {
                const response = await axios.get(`${url}/api/product/list-product`);
                if (!cancelled) {
                    setProductList(response.data.data || []);
                }
            } catch (error) {
                console.error("Product list fetch failed", error);
            }
        };

        loadProducts();

        return () => {
            cancelled = true;
        };
    }, [url]);

    useEffect(() => {
        if (!token) return;

        const loadCartData = async () => {
            try {
                const response = await axios.post(
                    `${url}/api/cart/get-cart`,
                    {},
                    { headers: { token } }
                );
                if (response.data?.success) {
                    setCartItems(response.data.cartData || {});
                }
            } catch (error) {
                console.error("Cart fetch failed", error);
                if (error.response?.status === 401) {
                    localStorage.removeItem("token");
                    window.dispatchEvent(new Event("tokenchange"));
                }
            }
        };

        loadCartData();
    }, [token, url]);

    useEffect(() => {
        if (!token) return;

        let cancelled = false;
        axios.get(`${url}/api/subscription/status`, { headers: { token } })
            .then((response) => {
                if (!cancelled) setSubscriptionStatus(response.data?.active ? "active" : null);
            })
            .catch((error) => {
                if (!cancelled) {
                    console.error("Subscription status fetch failed", error);
                    setSubscriptionStatus(null);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [token, url]);

    const sizePopupProduct = productList.find((p) => p._id === sizePopupItemId);
    const isLogedin = Boolean(token);

    const ContextValue = {
        searchBar,
        setSearchBar,
        currency,
        url,
        isLogedin,
        cartItems,
        setCartItems,
        removeFromCart,
        addToCart,
        getTotalCartAmt,
        getItemTotalQty,
        productList,
        token,
        setToken,
        dashboardLink,
        setDashboardLink,
        id,
        setId,
        fetchUserId,
        subscriptionStatus: token ? subscriptionStatus : null,
        openSizePopup,
        closeSizePopup,
    };

    return (
        <Context.Provider value={ContextValue}>
            {children}
            {sizePopupProduct && (
                <SizePopUp
                    product={sizePopupProduct}
                    onSelect={(size) => addToCart(sizePopupProduct._id, size)}
                    onClose={closeSizePopup}
                />
            )}
        </Context.Provider>
    );
};