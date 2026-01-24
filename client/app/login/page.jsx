"use client"
import { useContext, useState } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { Context } from "../context/Context";
import axios from "axios";


export default function LoginPage() {

    const [currState, setCurrState] = useState("Login");
    const [data, setData] = useState({
        email: '',
        password: ''
    });
    const [token, setToken] = useState("")
    const { url } = useContext(Context);

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

        if (response.data.success) {
            setToken(response.data.token)
            localStorage.setItem("token",token)
        } else {
            alert(response.data.message)
        }
    }
    return (
        <>
            <Navbar />
            <div className="flex items-center justify-center h-[50vw]">
                <div>
                    <div className="flex items-center justify-center gap-3">
                        <h1 className="text-4xl font-prata">{currState}</h1>
                        <hr className="h-[2] w-12 border-none rounded-b-full bg-gray-800" />
                    </div>

                    <form onSubmit={onLogin} className="text-center md:w-[45vw] lg:w-[20vw] my-8">
                        <div className="flex items-center justify-center flex-col gap-4">
                            <input onChange={onchangHandler} name="email" value={data.email} className="border border-gray-700 p-3 w-full outline-none" type="email" placeholder="Email" required />
                            <input onChange={onchangHandler} name="password" value={data.password} className="border border-gray-700 p-3 w-full outline-none" type="password" placeholder="Password" required />
                            <p className={currState === "Sign Up" ? "w-full -mt-4 text-[12px] text-left pl-2 text-gray-400" : "hidden"}>Make password of atleast 8 characters.</p>
                        </div>
                        <div className="flex items-center justify-between text-sm my-2">
                            <p>Forgot Password?</p>
                            <p className="hover:underline cursor-pointer" onClick={() => setCurrState("Sign Up")}>Create account</p>
                        </div>
                        <button type="submit" className="mt-6 text-white bg-black py-2 px-7 cursor-pointer">{currState}</button>
                    </form>
                </div>
            </div>
            <Footer />
        </>
    )
}