import Image from "next/image"
import { assets } from "../frontend_assets/assets"


export default function Hero() {
    return(
        <div className="flex items-center w-[85vw] lg:w-[70vw] m-auto border border-gray-700 max-sm:flex-col mb-16 mt-5">
            <div className="w-[50%] max-sm:w-full flex items-center justify-center my-8">
                <div>
                    <div className="flex items-center h-full gap-2.5">
                        <hr className="h-0.5 w-12 bg-gray-800 border-none " />
                        <span className="text-md uppercase font-normal tracking-wider">our bestsellers</span>
                    </div>
                    <h1 className="text-4xl font-prata my-5">Latest Arrivals</h1>
                    <div className="flex items-center tracking-wider gap-2.5">
                        <span className="text-md uppercase font-normal tracking-wider">shop now</span>
                        <hr className="h-0.5 w-12 bg-gray-400 border-none "/>
                    </div>
                </div>
            </div>

            <div className="w-[50%] h-full max-sm:w-full">
                <Image className="w-full" src={assets.hero_img} alt="hero-image"></Image>
            </div>
        </div>
    )
}