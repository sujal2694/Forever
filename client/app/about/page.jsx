import Navbar from "../components/Navbar"
import Image from "next/image"
import { assets } from "../frontend_assets/assets"

const About = () => {
    return (
        <div>
            <Navbar />
            <div className="w-[85vw] lg:w-[70vw] m-auto">
                <div className="w-full flex items-center justify-center gap-2">
                    <h1 className="uppercase text-2xl lg:text-3xl text-gray-500">about <span className="text-gray-800">us</span></h1>
                    <hr className="w-12 h-[2] border-none bg-black" />
                </div>

                <div className="flex items-start justify-between gap-10 my-10">
                    <div className="w-full">
                        <Image className="w-full" src={assets.about_img} alt=""></Image>
                    </div>

                    <div className="w-full">
                        <p className="text-md text-gray-500">Forever was born out of a passion for innovation and a desire to revolutionize the way people shop online. Our journey began with a simple idea: to provide a platform where customers can easily discover, explore, and purchase a wide range of products from the comfort of their homes.</p>
                        <br />
                        <p className="text-md text-gray-500">Since our inception, we've worked tirelessly to curate a diverse selection of high-quality products that cater to every taste and preference. From fashion and beauty to electronics and home essentials, we offer an extensive collection sourced from trusted brands and suppliers.</p>
                        <br />
                        <div>
                            <h3 className="text-lg">Our Mission</h3>
                            <br />
                            <p className="text-md text-gray-500">Our mission at Forever is to empower customers with choice, convenience, and confidence. We're dedicated to providing a seamless shopping experience that exceeds expectations, from browsing and ordering to delivery and beyond.</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default About
