"use client"
import { useContext, useState } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { Context } from "../context/Context";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";


export default function LoginPage() {

    const [currState, setCurrState] = useState("Login");
    const [data, setData] = useState({
        email: '',
        password: '',
        name: '',
        number: ''
    });
    const [token, setToken] = useState("")
    const { url } = useContext(Context);
    const router = useRouter();

    const onchangHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({ ...data, [name]: value }))
    }

    const onLogin = async (event) => {
        event.preventDefault();
        let newUrl = url;
        if (currState === "Login") {
            newUrl += "/api/user/login"
        } else {
            newUrl += "/api/user/register"
        }

        const response = await axios.post(newUrl, data);

        if (response.data.token) {
            setToken(response.data.token)
            localStorage.setItem("token", response.data.token)
            setData({
                email: "",
                password: "",
                name: "",
                number: ""
            })
            router.push("/");
            toast.success("Login successfull")
        } else {
            alert(response.data.message)
            toast.error(response.data.message)
        }
    }
    return (
        <>
            <Navbar />
            <div className="flex items-center justify-center h-[85vw] md:mt-20 lg:mt-20 mt-40">
                <div>
                    <div className="flex items-center justify-center gap-3">
                        <h1 className="text-4xl font-prata">{currState}</h1>
                        <hr className="h-[2] w-12 border-none rounded-b-full bg-gray-800" />
                    </div>

                    <form onSubmit={onLogin} className="text-center md:w-[45vw] lg:w-[20vw] my-8">
                        <div className="flex items-center justify-center flex-col gap-4">
                            {currState === "Sign Up" ? <input onChange={onchangHandler} name="name" value={data.name} className="border border-gray-700 p-3 w-full outline-none focus:ring ring-zinc-600" type="text" placeholder="Name" required /> : ""}

                            {currState === "Sign Up" ? <input onChange={onchangHandler} name="number" value={data.number} className="border border-gray-700 p-3 w-full outline-none focus:ring ring-zinc-600" type="text" placeholder="Phone Number" required /> : ""}

                            <input onChange={onchangHandler} name="email" value={data.email} className="border border-gray-700 p-3 w-full outline-none focus:ring ring-zinc-600" type="email" placeholder="Email" required />

                            <input onChange={onchangHandler} name="password" value={data.password} className="border border-gray-700 p-3 w-full outline-none focus:ring ring-zinc-600" type="password" placeholder="Password" required />

                            <p className={currState === "Sign Up" ? "w-full -mt-4 text-[12px] text-left pl-2 text-gray-400" : "hidden"}>Make password of atleast 8 characters.</p>
                        </div>
                        <div className="text-left mt-4">
                            <div>
                                <input type="checkbox" className={currState === "Sign Up" ? "mt-4" : "hidden"} />
                                <span className={currState === "Sign Up" ? "ml-2 text-gray-700 tracking-wider text-sm" : "hidden"}>
                                    Admin
                                </span>
                            </div>
                        </div>
                        <div className="flex items-start md:items-center lg:items-center justify-between lg:flex-row md:flex-row flex-col text-sm my-2">
                            <p>Forgot Password?</p>
                            {currState === "Sign Up"
                                ? <>
                                    <p className="hover:underline cursor-pointer" onClick={() => setCurrState("Sign In")}>Alredy have an account</p>
                                </>
                                : <>
                                    <p className="hover:underline cursor-pointer" onClick={() => setCurrState("Sign Up")}>Create account</p>
                                </>
                            }
                        </div>
                        <button type="submit" className="mt-6 text-white bg-black py-2 px-7 cursor-pointer hover:bg-transparent hover:text-black hover:outline hover:outline-black hover:shadow-login-button hover:shadow-gray-600 transition-all ease-in duration-150">{currState}</button>
                    </form>
                </div>
            </div>
            <Footer />
        </>
    )
}