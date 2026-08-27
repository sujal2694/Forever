"use client"
import { createContext, useEffect, useState } from "react";

export const Context = createContext(null);

export const ContextProvider = ({ children }) => {
    const [token, setToken] = useState("");
    const [link, setLink] = useState('dashboard');
    const url = "http://localhost:4000";
    // const url = "https://forever-server-p2gu.onrender.com"


    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedToken = localStorage.getItem("adminToken") || "";
            setToken(storedToken);
        }
    }, [])

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