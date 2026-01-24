"use client"
import { createContext, useState } from "react";
import { products } from "../frontend_assets/assets";

export const Context = createContext();

export const ContextProvider = ({ children }) => {

    const [searchBar, setSearchBar] = useState(true);
    const currency = 86;
    const url = "http://localhost:4000"

    const ContextValue = {
        searchBar,
        setSearchBar,
        currency,
        url,
    }

    return (
        <Context.Provider value={ContextValue}>
            {children}
        </Context.Provider>
    )
}