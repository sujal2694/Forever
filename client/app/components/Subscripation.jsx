import Image from "next/image"
import { assets } from "../frontend_assets/assets"

const Subscripation = () => {
    return (
        <div className="w-full ">
            <div className="w-[85vw] lg:w-[70vw] m-auto flex items-center  justify-around gap-5 mt-24 mb-14">
                <div className="flex items-center justify-center flex-col gap-2">
                    <Image className="w-12" src={assets.exchange_icon} alt=""></Image>
                    <div className="text-center">
                        <p className="text-md font-semibold">Easy Exchange Policy</p>
                        <span className="text-sm text-gray-400">We offer hassle free exchange policy</span>
                    </div>
                </div>
                <div className="flex items-center justify-center flex-col gap-2">
                    <Image className="w-12" src={assets.quality_icon} alt=""></Image>
                    <div className="text-center">
                        <p className="text-md font-semibold">7 Days Return Policy</p>
                        <span className="text-sm text-gray-400">We provide 7 days free return policy</span>
                    </div>
                </div>
                <div className="flex items-center justify-center flex-col gap-2">
                    <Image className="w-12" src={assets.support_img} alt=""></Image>
                    <div className="text-center">
                        <p className="text-md font-semibold">Best customer support</p>
                        <span className="text-sm text-gray-400">We provide 24/7 customer support</span>
                    </div>
                </div>
            </div>

                <div className="w-screen mb-40">
                    <div className="flex items-center justify-center flex-col w-[85vw] lg:w-[70vw] m-auto ">
                        <h1 className="text-2xl font-semibold mb-3">Subscribe now & get 20% off</h1>
                        <p className="text-lg text-gray-400 mb-4">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Totam.</p>
                        <div className="lg:w-[30vw] md:w-[40vw] h-12 flex items-center">
                            <input className="w-full border border-gray-300 border-r-0 h-full px-4 text-sm" type="text" placeholder="Enter your email" />
                            <button className="bg-black text-white text-xs uppercase h-full px-9">subscribe</button>
                        </div>
                    </div>
                </div>
        </div>
    )
}

export default Subscripation
