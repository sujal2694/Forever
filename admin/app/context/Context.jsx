"use client"
import { createContext, useState } from "react";

export const Context = createContext(null);

export const ContextProvider = ({ children }) => {
    const [token, setToken] = useState(() => (
        typeof window === "undefined" ? "" : localStorage.getItem("adminToken") || ""
    ));
    const [link, setLink] = useState('dashboard');
    const url = "http://localhost:4000";
    // const url = "https://forever-r56t.onrender.com"

    const contextValue = {
        url,
        token,
        setToken,
        link,
        setLink,
    }

    return (
        <Context.Provider value={contextValue}>
            {children}
        </Context.Provider>
    )
}