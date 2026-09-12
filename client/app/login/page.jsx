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
                toast.error(response.data.message)
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
            <main className="flex min-h-screen items-start justify-center px-4 pb-16 pt-32 sm:px-6 lg:pt-40">
                <div className="w-full max-w-md">
                    <div className="text-center">
                        <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-gray-400">Welcome to Forever</p>
                        <h1 className="text-3xl font-medium tracking-tight text-gray-900 sm:text-4xl">{heading}</h1>
                        <hr className="h-[2] w-12 border-none rounded-b-full bg-gray-800" />
                    </div>

                    <form onSubmit={onLogin} className="my-8 w-full space-y-4" noValidate>
                        <div className="flex flex-col gap-4">
                            {isSignUp && (
                                <input autoComplete="name" onChange={onchangHandler} name="name" value={data.name} className="h-12 w-full border border-gray-300 px-4 text-sm outline-none focus:border-black focus:ring-2 focus:ring-black/10" type="text" placeholder="Name" required />
                            )}

                            {isSignUp && (
                                <input autoComplete="tel" onChange={onchangHandler} name="number" value={data.number} className="h-12 w-full border border-gray-300 px-4 text-sm outline-none focus:border-black focus:ring-2 focus:ring-black/10" type="tel" placeholder="Phone Number" required />
                            )}

                            <input autoComplete="email" onChange={onchangHandler} name="email" value={data.email} className="h-12 w-full border border-gray-300 px-4 text-sm outline-none focus:border-black focus:ring-2 focus:ring-black/10" type="email" placeholder="Email" required />

                            <input autoComplete={isSignUp ? "new-password" : "current-password"} onChange={onchangHandler} name="password" value={data.password} className="h-12 w-full border border-gray-300 px-4 text-sm outline-none focus:border-black focus:ring-2 focus:ring-black/10" type="password" placeholder="Password" minLength={8} required />

                            {isSignUp && (
                                <p className="w-full -mt-4 text-[12px] text-left pl-2 text-gray-400">Make password of atleast 8 characters.</p>
                            )}
                        </div>

                        <div className="my-2 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500">
                            <p>Forgot Password?</p>
                            {isSignUp
                                ? <p className="hover:underline cursor-pointer" onClick={() => setIsSignUp(false)}>Already have an account</p>
                                : <p className="hover:underline cursor-pointer" onClick={() => setIsSignUp(true)}>Create account</p>
                            }
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-6 w-full cursor-pointer bg-black py-3 text-sm font-medium uppercase tracking-wider text-white transition-all ease-in duration-150 hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? "Please wait..." : heading}
                        </button>
                    </form>
                </div>
            </main>
        </>
    )
}