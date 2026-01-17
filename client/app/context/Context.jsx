"use client"
import { createContext, useState } from "react";

export const Context = createContext();

export const ContextProvider = ({ children }) => {

    const [product_list, setProductList] = useState();
    const [searchBar, setSearchBar] = useState(true);
    const currency = 86;

    const ContextValue = {
        searchBar,
        setSearchBar,
        currency,
    }

    return (
        <Context.Provider value={ContextValue}>
            {children}
        </Context.Provider>
    )
}