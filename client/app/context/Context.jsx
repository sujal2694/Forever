"use client"
import { createContext, useEffect, useState } from "react";

export const Context = createContext();

export const ContextProvider = ({ children }) => {

    const [searchBar, setSearchBar] = useState(true);
    const [isLogedin, setIsLogedin] = useState(false);
    const currency = 86;
    const url = "http://localhost:4000"

    const fetchUser = () => {
        let token = localStorage.getItem('token');
        if(token !== null){
            setIsLogedin(true);
        } else {
            setIsLogedin(false);
        }
    }

    useEffect(()=>{
        fetchUser();
    },[])

    const ContextValue = {
        searchBar,
        setSearchBar,
        currency,
        url,
        isLogedin,
    }

    return (
        <Context.Provider value={ContextValue}>
            {children}
        </Context.Provider>
    )
}