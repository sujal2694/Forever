"use client"
import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import ProductPage from "../components/Products";
import Qualities from "../components/Qualities";
import Subscripation from "../components/Subscription";
import Navbar from "../components/Navbar";



export default function HomePage() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen py-10 px-4 mt-20 fade-in">
                <Navbar />
                <div className="flex items-center justify-center max-h-screen">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-add-button rounded-full animate-spin"></div>
                </div>
                <Footer />
            </div>
        )
    }

    return(
        <>
        <Hero/>
        <ProductPage/>
        <Qualities/>
        <Subscripation/>
        <Footer/>
        </>
    )
}