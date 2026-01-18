import Footer from "../components/Footer";
import Navbar from "../components/Navbar";


export default function LoginPage() {
    return(
        <>
        <Navbar/>
        <div className="flex items-center justify-center h-[50vw]">
            <div>
                <div className="flex items-center justify-center gap-3">
                    <h1 className="text-4xl font-prata">Login</h1>
                    <hr className="h-[2] w-12 border-none rounded-b-full bg-gray-800" />
                </div>

                <form className="text-center md:w-[45vw] lg:w-[20vw] my-8">
                    <div className="flex items-center justify-center flex-col gap-4">
                        <input className="border border-gray-700 p-3 w-full outline-none" type="email" placeholder="Email" required/>
                        <input className="border border-gray-700 p-3 w-full outline-none" type="password" placeholder="Password" required/>
                    </div>
                    <div className="flex items-center justify-between text-sm my-2">
                        <p>Forgot Password?</p>
                        <p>Create account</p>
                    </div>
                    <button type="submit" className="mt-6 text-white bg-black py-2 px-7 cursor-pointer">Sign In</button>
                </form>
            </div>
        </div>
        <Footer/>
        </>
    )
}