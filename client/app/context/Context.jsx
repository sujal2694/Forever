"use client"
import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const Context = createContext();

export const ContextProvider = ({ children }) => {

    const [searchBar, setSearchBar] = useState(true);
    const [isLogedin, setIsLogedin] = useState(false);
    const currency = 86;
    const url = "http://localhost:4000";
    const [cartItems, setCartItems] = useState({});
    const [productList, setProductList] = useState([]);

    const fetchUser = () => {
        let token = localStorage.getItem('token');
        if (token !== null) {
            setIsLogedin(true);
        } else {
            setIsLogedin(false);
        }
    }

    const addToCart = async (itemid) => {
        if (!cartItems[itemid]) {
            setCartItems(prev => ({ ...prev, [itemid]: 1 }))
        } else {
            setCartItems(prev => ({ ...prev, [itemid]: prev[itemid] + 1 }))
        }
        if (token) {
            await axios.post(url + "/api/cart/add-to-cart", { itemid }, { headers: { token } });
        }
    }

    const removeFromCart = async (itemid) => {
        setCartItems(prev => ({ ...prev, [itemid]: prev[itemid] - 1 }));
        if (token) {
            await axios.post(url + "/api/cart/remove-from-cart", { itemid }, { headers: { token } });
        }
    }

    const getTotalCartAmt = async () => {
        let totalAmt = 0;
        for (const item in cartData) {
            if (cartItems[item] > 0) {
                let itemInfo = productList.find((product) => product._id === item);
                totalAmt += itemInfo.price * cartData[item]
            }
        }
        return totalAmt;
    }

    const fetchProductList = async () => {
        const response = await axios.get(url+"/api/product/list-product");
        setProductList(response.data.data);
    }

    const cartData = async (token) => {
        const response = await axios.post(url+"/api/cart/get-cart",{},{headers:{token}});
        setCartItems(response.data.cartData);
    }

    useEffect(() => {
        fetchUser();
        fetchProductList();
    }, [])

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
    }

    return (
        <Context.Provider value={ContextValue}>
            {children}
        </Context.Provider>
    )
}