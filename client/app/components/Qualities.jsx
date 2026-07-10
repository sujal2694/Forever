import Image from "next/image"
import { assets } from "../assets/assets"

const Qualities = () => {
  return (
    <div className="w-full fade-in">
      <div className="w-[90vw] lg:w-[80vw] m-auto grid grid-cols-1 lg:grid-cols-3 md:grid-cols-3 gap-20 mb-26 mt-40 ">

        <div className="flex items-center justify-center flex-col bg-zinc-100/50 py-10 rounded-2xl hover:shadow-button shadow-zinc-800/20 transition-all duration-300">
          <Image className="mb-5 w-14" src={assets.exchange_icon} alt="" loading="eager"></Image>
          <p className="font-semibold text-[17px]">Easy Exchange Policy</p>
          <span className="text-[15px] text-gray-400">We offer hassle free exchange policy</span>
        </div>

        <div className="flex items-center justify-center flex-col bg-zinc-100/50 py-10 rounded-2xl hover:shadow-button shadow-zinc-800/20 transition-all duration-300">
          <Image className="mb-5 w-14" src={assets.quality_icon} alt="" loading="eager"></Image>
          <p className="font-semibold text-[17px]">7 Days Return Policy</p>
          <span className="text-[15px] text-gray-400">We provide 7 days free return policy</span>
        </div>

        <div className="flex items-center justify-center flex-col bg-zinc-100/50 py-10 rounded-2xl hover:shadow-button shadow-zinc-800/20 transition-all duration-300">
          <Image className="mb-5 w-14" src={assets.support_img} alt="" loading="eager"></Image>
          <p className="font-semibold text-[17px]">Best customer support</p>
          <span className="text-[15px] text-gray-400">we provide 24/7 customer support</span>
        </div>

      </div>
    </div>
  )
}

export default Qualities
