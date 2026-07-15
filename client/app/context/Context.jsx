"use client"
import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const Context = createContext();

export const ContextProvider = ({ children }) => {
    const [searchBar, setSearchBar] = useState(true);
    const currency = 86;
    const url = "http://localhost:4000";
    // const url = "https://forever-backend-phi-three.vercel.app"
    const [cartItems, setCartItems] = useState({});
    const [productList, setProductList] = useState([]);
    const [token, setToken] = useState("");
    const [isLogedin, setIsLogedin] = useState(false);

    const addToCart = async (itemid) => {
        const safeItemId = itemid;
        setCartItems((prev) => ({
            ...prev,
            [safeItemId]: (prev[safeItemId] || 0) + 1,
        }));

        if (token) {
            try {
                await axios.post(
                    `${url}/api/cart/add-to-cart`,
                    { itemId: safeItemId },
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
        }
    };

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedToken = localStorage.getItem("token") || "";
            setToken(storedToken);
            setIsLogedin(Boolean(storedToken));
        }

        fetchProductList();
    }, []);

    useEffect(() => {
        setIsLogedin(Boolean(token));
        if (token) {
            fetchCartData(token);
        }
        console.log(cartItems);
        
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
    };

    return <Context.Provider value={ContextValue}>{children}</Context.Provider>;
};