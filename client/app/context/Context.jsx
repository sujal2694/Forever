"use client"
import axios from "axios";
import { createContext, useEffect, useState } from "react";
import SizePopUp from "../components/SizePopUp";

export const Context = createContext();

export const ContextProvider = ({ children }) => {
    const [searchBar, setSearchBar] = useState(true);
    const currency = 86;
    // const url = "http://localhost:4000";
    const url = "https://forever-r56t.onrender.com"
    const [cartItems, setCartItems] = useState({});
    const [productList, setProductList] = useState([]);
    const [token, setToken] = useState("");
    const [isLogedin, setIsLogedin] = useState(false);
    const [dashboardLink, setDashboardLink] = useState("Dashboard");
    const [id, setId] = useState("");


    const addToCart = async (itemid, size) => {
        const safeItemId = itemid;
        setCartItems((prev) => ({
            ...prev,
            [safeItemId]: (prev[safeItemId] || 0) + 1,
        }));

        if (token) {
            if (!size) {
                return (
                    <SizePopUp/>
                )
            }
            try {
                await axios.post(
                    `${url}/api/cart/add-to-cart`,
                    {
                        itemId: safeItemId,
                        size: size
                    },
                    { headers: { token } }
                );
            } catch (error) {
                console.error("Add to cart failed", error);
            }
        }
    };

    const removeFromCart = async (itemid) => {
        setCartItems((prev) => {
            const nextCart = { ...prev };
            if (!nextCart[itemid]) return nextCart;
            nextCart[itemid] = Math.max(0, nextCart[itemid] - 1);
            if (nextCart[itemid] === 0) delete nextCart[itemid];
            return nextCart;
        });

        if (token) {
            try {
                await axios.post(
                    `${url}/api/cart/remove-from-cart`,
                    { itemId: itemid },
                    { headers: { token } }
                );
            } catch (error) {
                console.error("Remove from cart failed", error);
            }
        }
    };

    const getTotalCartAmt = () => {
        let totalAmt = 0;
        Object.entries(cartItems).forEach(([itemId, quantity]) => {
            if (quantity <= 0) return;
            const itemInfo = productList.find((product) => product._id === itemId);
            if (itemInfo) {
                totalAmt += itemInfo.price * quantity;
            }
        });
        return totalAmt;
    };

    const fetchProductList = async () => {
        try {
            const response = await axios.get(`${url}/api/product/list-product`);
            setProductList(response.data.data || []);
        } catch (error) {
            console.error("Product list fetch failed", error);
        }
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
                setIsLogedin(false);
            }
        }
    };

    const fetchUserId = async () => {
        const userEmails = []
        try {
            const users = await axios.get(url + '/api/user/list-users');
            users.data.users.map((user) => {
                userEmails.push(user.email)
            })
            const currentToken = localStorage.getItem("token");
            const currentUser = await axios.get(url + '/api/user/profile', { headers: { token: currentToken } });
            if (
                userEmails.map((email) => {
                    if (email === currentUser.data.user.email) {
                        return true
                    } else {
                        return false
                    }
                })
            ) {
                return currentUser.data.user._id
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedToken = localStorage.getItem("token") || "";
            setToken(storedToken);
            localStorage.setItem("token", storedToken);
            setIsLogedin(Boolean(storedToken));
        }

        fetchProductList();
    }, []);

    useEffect(() => {
        setIsLogedin(Boolean(token));
        if (token) {
            fetchUserId();
            fetchCartData(token);
        }
    }, [token]);

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
        productList,
        token,
        setToken,
        dashboardLink,
        setDashboardLink,
        id,
        setId,
        fetchUserId,
    };

    return <Context.Provider value={ContextValue}>{children}</Context.Provider>;
};