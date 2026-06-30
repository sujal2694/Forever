import Footer from "../components/Footer";
import Hero from "../components/Hero";
import ProductPage from "../components/Products";
import Qualities from "../components/Qualities";
import Subscripation from "../components/Subscription";



export default function HomePage() {
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