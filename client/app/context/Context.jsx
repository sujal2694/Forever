"use client"
import { createContext, useState } from "react";
import { products } from "../frontend_assets/assets";

export const Context = createContext();

export const ContextProvider = ({ children }) => {

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