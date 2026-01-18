import Image from "next/image"
import { assets } from "../frontend_assets/assets"

const Footer = () => {
    return (
        <div>
            <div className="flex items-start justify-between w-[85vw] m-auto mb-10 mt-16">
                <div className="w-90">
                    <Image className="w-30" src={assets.logo} alt="logo" ></Image>
                    <p className="mt-4 text-sm text-gray-500">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
                </div>

                <div className="flex items-start gap-10">
                    <div>
                        <h3 className="uppercase text-xl">Company</h3>
                        <ul className="mt-4 text-sm text-gray-500 flex items-start flex-col gap-1.5">
                            <li>Home</li>
                            <li>About us</li>
                            <li>Delivery</li>
                            <li>Privacy policy</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="uppercase text-xl">get in touch</h3>
                        <ul className="mt-4 text-sm text-gray-500 flex items-start flex-col gap-1.5">
                            <li>+1-000-000-000</li>
                            <li>forever@gmail.com</li>
                            <li>Instagram</li>
                        </ul>
                    </div>
                </div>
            </div>
            <hr className="h-[1] border-none bg-gray-300 rounded-bl-4xl w-[85vw] m-auto" />
            <p className="py-4 text-center text-[14px]">Copyright 2025@ Forever - All Right Reserved.</p>
        </div>
    )
}

export default Footer
