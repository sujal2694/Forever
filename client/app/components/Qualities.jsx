import Image from "next/image"
import { assets } from "../assets/assets"


const Qualities = () => {
  return (
    <div className="fade-in w-[90vw] lg:w-[80vw] m-auto mb-32 overflow-hidden" >
      <div className="marquee-track flex items-center gap-10 w-max py-10">

        <div className="flex items-center justify-center flex-col bg-yellow-100/50 py-10 rounded-2xl hover:shadow-quality shadow-yellow-700/60 transition-all w-[350px] duration-300">
          <Image className="mb-5 w-14" src={assets.exchange_icon} alt="" loading="eager"></Image>
          <p className="font-semibold text-[17px]">Easy Exchange Policy</p>
          <span className="text-[15px] text-yellow-500">We offer hassle free exchange policy</span>
        </div>

        <div className="flex items-center justify-center flex-col bg-yellow-100/50 py-10 rounded-2xl hover:shadow-quality shadow-yellow-700/60 transition-all w-[350px] duration-300">
          <Image className="mb-5 w-14" src={assets.quality_icon} alt="" loading="eager"></Image>
          <p className="font-semibold text-[17px]">7 Days Return Policy</p>
          <span className="text-[15px] text-yellow-500">We provide 7 days free return policy</span>
        </div>

        <div className="flex items-center justify-center flex-col bg-yellow-100/50 py-10 rounded-2xl hover:shadow-quality shadow-yellow-700/60 transition-all w-[350px] duration-300">
          <Image className="mb-5 w-14" src={assets.support_img} alt="" loading="eager"></Image>
          <p className="font-semibold text-[17px]">Best customer support</p>
          <span className="text-[15px] text-yellow-500">we provide 24/7 customer support</span>
        </div>

        {/* duplicate set for seamless loop */}

        <div className="flex items-center justify-center flex-col bg-yellow-100/50 py-10 rounded-2xl hover:shadow-quality shadow-yellow-700/60 transition-all w-[350px] duration-300">
          <Image className="mb-5 w-14" src={assets.exchange_icon} alt="" loading="eager"></Image>
          <p className="font-semibold text-[17px]">Easy Exchange Policy</p>
          <span className="text-[15px] text-yellow-500">We offer hassle free exchange policy</span>
        </div>

        <div className="flex items-center justify-center flex-col bg-yellow-100/50 py-10 rounded-2xl hover:shadow-quality shadow-yellow-700/60 transition-all w-[350px] duration-300">
          <Image className="mb-5 w-14" src={assets.quality_icon} alt="" loading="eager"></Image>
          <p className="font-semibold text-[17px]">7 Days Return Policy</p>
          <span className="text-[15px] text-yellow-500">We provide 7 days free return policy</span>
        </div>

        <div className="flex items-center justify-center flex-col bg-yellow-100/50 py-10 rounded-2xl hover:shadow-quality shadow-yellow-700/60 transition-all w-[350px] duration-300">
          <Image className="mb-5 w-14" src={assets.support_img} alt="" loading="eager"></Image>
          <p className="font-semibold text-[17px]">Best customer support</p>
          <span className="text-[15px] text-yellow-500">we provide 24/7 customer support</span>
        </div>

      </div>
    </div >
  )
}
export default Qualities
