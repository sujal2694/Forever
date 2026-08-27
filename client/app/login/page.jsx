"use client"
import { useContext, useState } from "react";
import Navbar from "../components/Navbar";
import { Context } from "../context/Context";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function LoginPage() {

    const { setToken, url } = useContext(Context);
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        email: '',
        password: '',
        name: '',
        number: '',
        token:''
    });
    const router = useRouter();

    const onchangHandler = (event) => {
        const { name, value } = event.target;
        setData(data => ({ ...data, [name]: value }))
    }

    const onLogin = async (event) => {
        event.preventDefault();
        if (loading) return;

        const newUrl = url + (isSignUp ? "/api/user/register" : "/api/user/login");

        const payload = isSignUp
            ? {
                name: data.name,
                number: data.number,
                email: data.email,
                password: data.password,
            }
            : {
                email: data.email,
                password: data.password,
            };

        setLoading(true);
        try {
            const response = await axios.post(newUrl, payload);

            if (response.data.token) {
                setToken(response.data.token)
                localStorage.setItem("token", response.data.token)
                if (response.data.role) {
                    localStorage.setItem("role", response.data.role)
                }
                setData({
                    email: "",
                    password: "",
                    name: "",
                    number: ""
                })
                router.push("/");
                toast.success("Login successful")
            } else {
                toast.error(response.data.message || "Something went wrong")
            }
        } catch (err) {
            const message = err?.response?.data?.message || "Unable to reach the server. Please try again.";
            toast.error(message)
        } finally {
            setLoading(false);
        }
    }

    const heading = isSignUp ? "Sign Up" : "Login";

    return (
        <>
            <Navbar />
            <div className="flex items-start justify-center md:mt-20 lg:mt-20 mt-40 pt-20">
                <div>
                    <div className="flex items-center justify-center gap-3">
                        <h1 className="text-4xl font-prata">{heading}</h1>
                        <hr className="h-[2] w-12 border-none rounded-b-full bg-gray-800" />
                    </div>

                    <form onSubmit={onLogin} className="text-center md:w-[45vw] lg:w-[20vw] my-8">
                        <div className="flex items-center justify-center flex-col gap-4">
                            {isSignUp && (
                                <input onChange={onchangHandler} name="name" value={data.name} className="border border-gray-700 p-3 w-full outline-none focus:ring ring-zinc-600" type="text" placeholder="Name" required />
                            )}

                            {isSignUp && (
                                <input onChange={onchangHandler} name="number" value={data.number} className="border border-gray-700 p-3 w-full outline-none focus:ring ring-zinc-600" type="tel" placeholder="Phone Number" required />
                            )}

                            <input onChange={onchangHandler} name="email" value={data.email} className="border border-gray-700 p-3 w-full outline-none focus:ring ring-zinc-600" type="email" placeholder="Email" required />

                            <input onChange={onchangHandler} name="password" value={data.password} className="border border-gray-700 p-3 w-full outline-none focus:ring ring-zinc-600" type="password" placeholder="Password" minLength={8} required />

                            {isSignUp && (
                                <p className="w-full -mt-4 text-[12px] text-left pl-2 text-gray-400">Make password of atleast 8 characters.</p>
                            )}
                        </div>

                        <div className="flex items-start md:items-center lg:items-center justify-between lg:flex-row md:flex-row flex-col text-sm my-2">
                            <p>Forgot Password?</p>
                            {isSignUp
                                ? <p className="hover:underline cursor-pointer" onClick={() => setIsSignUp(false)}>Already have an account</p>
                                : <p className="hover:underline cursor-pointer" onClick={() => setIsSignUp(true)}>Create account</p>
                            }
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-6 text-white bg-black py-2 px-7 cursor-pointer hover:bg-transparent hover:text-black hover:outline hover:outline-black hover:shadow-login-button hover:shadow-gray-600 transition-all ease-in duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Please wait..." : heading}
                        </button>
                    </form>
                </div>
            </div>
        </>
    )
}