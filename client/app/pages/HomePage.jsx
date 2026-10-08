"use client"
import { useContext } from "react";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import ProductPage from "../components/Products";
import Qualities from "../components/Qualities";
import Subscripation from "../components/Subscription";
import { Context } from "../context/Context";

export default function HomePage() {
    const { subscriptionStatus } = useContext(Context);

    return (
        <>
            <Hero />
            {subscriptionStatus === "active" && <Subscripation />}
            <ProductPage />
            <Qualities />
            <Footer />
        </>
    )
}