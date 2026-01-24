import Navbar from "../components/Navbar"
import Image from "next/image"
import { assets } from "../frontend_assets/assets"
import Subscripation from "../components/Subscripation"
import Footer from "../components/Footer"

const About = () => {
    return (
        <div>
            <Navbar />
            <div className="w-[85vw] lg:w-[70vw] m-auto">
                <div className="w-full flex items-center justify-center gap-2 my-10">
                    <h1 className="uppercase text-2xl lg:text-3xl text-gray-500">about <span className="text-gray-800">us</span></h1>
                    <hr className="w-12 h-[2] border-none bg-black" />
                </div>

                <div className="flex items-start justify-between gap-10 my-10 h-[500px] lg:h-[700px]">
                    <div className="w-full h-full">
                        <Image className="w-full h-full" src={assets.about_img} alt=""></Image>
                    </div>

                    <div className="w-full lg:w-[30vw]">
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

                <div className="my-10">
                    <div className="w-full flex items-center gap-2">
                        <h1 className="uppercase text-2xl lg:text-3xl text-gray-500">why <span className="text-gray-800">choose us</span></h1>
                        <hr className="w-12 h-[2] border-none bg-black" />
                    </div>

                    <div className="flex items-center my-10">
                        <div className="h-80 py-18 px-16 flex items-center justify-center flex-col border-2 border-gray-200">
                            <h3 className="text-md font-semibold">Quality Assurance:</h3>
                            <br />
                            <p className="text-sm text-gray-400">We meticulously select and vet each product to ensure it meets our stringent quality standards.</p>
                        </div>

                        <div className="h-80 py-18 px-16 flex items-center justify-center flex-col border-2 border-gray-200">
                            <h3 className="text-md font-semibold">Convenience:</h3>
                            <br />
                            <p className="text-sm text-gray-400">With our user-friendly interface and hassle-free ordering process, shopping has never been easier.</p>
                        </div>

                        <div className="h-80 py-18 px-16 flex items-center justify-center flex-col border-2 border-gray-200">
                            <h3 className="text-md font-semibold">Exceptional Customer Service:</h3>
                            <br />
                            <p className="text-sm text-gray-400">Our team of dedicated professionals is here to assist you the way, ensuring your satisfaction is our top priority.</p>
                        </div>
                    </div>
                </div>

                <div className="my-20">
                    <Subscripation />
                </div>
                <Footer />
            </div>
        </div>
    )
}

export default About
