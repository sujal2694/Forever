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

export const ContextProvider = ({ children }) => {
    const [searchBar, setSearchBar] = useState(true);
    const currency = 86;
    // const url = "https://forever-r56t.onrender.com";
    const url = "http://localhost:4000";
    const [cartItems, setCartItems] = useState({}); // { itemId: { size: qty } }
    const [productList, setProductList] = useState([]);
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

        setCartItems((prev) => {
            const sizes = { ...(prev[itemId] || {}) };
            sizes[size] = (sizes[size] || 0) + 1;
            return { ...prev, [itemId]: sizes };
        });

        closeSizePopup();

        if (token) {
            try {
                await axios.post(
                    `${url}/api/cart/add-to-cart`,
                    { itemId, size },
                    { headers: { token } }
                );
                toast.success("Item added to cart");
            } catch (error) {
                console.error("Add to cart failed", error);
            }
        }
    };

    const removeFromCart = async (itemId, size) => {
        setCartItems((prev) => {
            const sizes = { ...(prev[itemId] || {}) };
            if (!sizes[size]) return prev;

            sizes[size] = Math.max(0, sizes[size] - 1);
            if (sizes[size] === 0) delete sizes[size];

            const next = { ...prev };
            if (Object.keys(sizes).length === 0) {
                delete next[itemId];
            } else {
                next[itemId] = sizes;
            }
            return next;
        });

        if (token) {
            try {
                await axios.post(
                    `${url}/api/cart/remove-from-cart`,
                    { itemId, size },
                    { headers: { token } }
                );
                toast.success("Item removed from cart");
            } catch (error) {
                console.error("Remove from cart failed", error);
            }
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
        const userEmails = [];
        try {
            const users = await axios.get(url + '/api/user/list-users');
            users.data.users.forEach((user) => userEmails.push(user.email));
            const currentToken = localStorage.getItem("token");
            const currentUser = await axios.get(url + '/api/user/profile', { headers: { token: currentToken } });
            if (userEmails.includes(currentUser.data.user.email)) {
                return currentUser.data.user._id;
            }
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

        fetchUserId();

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