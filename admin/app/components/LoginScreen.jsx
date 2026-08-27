'use client'
import React, { useContext, useState } from 'react'
import { Context } from '../context/Context'
import { Spinner } from '@/components/ui/spinner';
import axios from 'axios';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { assets } from '../assets/assets';

function LoginScreen() {
    const { setIsLogin, setToken, url } = useContext(Context);
    const [isSignUp, setIsSignUp] = useState("sign-up");
    const [loading, setLoading] = useState(false);
    const [adminData, setAdminData] = useState({
        orgname: "",
        ownname: "",
        email: "",
        number: "",
        password: ""
    })

    const handleOnchange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setAdminData(adminData => ({ ...adminData, [name]: value }))
    }

    const handleSignIn = async (e) => {
        e.preventDefault();
        if (loading) return;
        try {
            setLoading(true);

            const newUrl = url + (isSignUp === 'sign-up' ? "/api/admin/register" : "/api/admin/login");

            const payload = isSignUp === 'sign-up'
                ? adminData
                : { email: adminData.email, password: adminData.password };

            const response = await axios.post(newUrl, payload);

            if (response.data.success) {
                if (response.data.token) {
                    setToken(response.data.token);
                    localStorage.setItem("adminToken", response.data.token);
                }
                setAdminData({
                    orgname: "",
                    ownname: "",
                    email: "",
                    number: "",
                    password: ""
                });
                setIsLogin(true);
                toast.success(response.data.message)
            } else {
                toast.error(response.data.message)
            }

        } catch (error) {
            console.log(error);
            const message = error?.response?.data?.message || "Unable to reach the server. Please try again.";
            toast.error(message)
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className='flex items-center justify-center w-full min-h-screen'>
                <Spinner className={'size-8'} />
            </div>
        )
    }

    return (
        <div className='w-screen min-h-screen flex items-center justify-center'>
            <div className='border border-gray-700/30 rounded-2xl p-8 shadow-login max-sm:w-[95vw]'>
            <div className='mb-8'>
                <Image src={assets.logo} alt='logo' className='w-40'></Image>
            </div>
                <div className='flex items-center justify-center gap-5'>
                    <div
                        onClick={() => setIsSignUp("sign-in")}
                        className={`px-5 py-2 rounded-2xl transition-all duration-300 cursor-pointer ${isSignUp === "sign-in" ? "bg-black text-white" : "bg-gray-500/20"}`}
                    >
                        <p className='uppercase text-md font-semibold tracking-wide'>sign in</p>
                    </div>
                    <hr className='border-none w-[1] h-4 bg-gray-500' />
                    <div
                        onClick={() => setIsSignUp("sign-up")}
                        className={`px-5 py-2 rounded-2xl transition-all duration-300 cursor-pointer ${isSignUp === "sign-up" ? "bg-black text-white" : "bg-gray-500/20"}`}
                    >
                        <p className='uppercase text-md font-semibold tracking-wide'>sign up</p>
                    </div>
                </div>

                <div className='mt-5 w-[50vw] lg:w-[25vw] max-sm:w-full'>
                    <form className='w-full' onSubmit={handleSignIn}>
                        {isSignUp === 'sign-up'
                            ? (
                                <>
                                    <div className='flex flex-col items-start justify-center mb-3'>
                                        <label htmlFor="org-name" className='text-sm font-semibold tracking-wide'>Organization name</label>
                                        <input name='orgname' value={adminData.orgname} onChange={handleOnchange} type="text" id='org-name' className="border border-gray-400 rounded-md mt-1 w-full py-3 px-5 text-sm font-semibold" placeholder="E.g. Jame's house rental" required />
                                    </div>
                                    <div className='flex flex-col items-start justify-center mb-3'>
                                        <label htmlFor="own-name" className='text-sm font-semibold tracking-wide'>Owner's name</label>
                                        <input name='ownname' value={adminData.ownname} onChange={handleOnchange} type="text" id='own-name' className="border border-gray-400 rounded-md mt-1 w-full py-3 px-5 text-sm font-semibold" placeholder="E.g. Jame's" required />
                                    </div>
                                    <div className='flex flex-col items-start justify-center mb-3'>
                                        <label htmlFor="number" className='text-sm font-semibold tracking-wide'>Number</label>
                                        <input name='number' value={adminData.number} onChange={handleOnchange} type="tel" id='number' className="border border-gray-400 rounded-md mt-1 w-full py-3 px-5 text-sm font-semibold" placeholder="E.g. 90******99" required />
                                    </div>
                                </>
                            ) : (
                                <></>
                            )}
                        <div className='flex flex-col items-start justify-center mb-3'>
                            <label htmlFor="e-mail" className='text-sm font-semibold tracking-wide'>E-mail</label>
                            <input name='email' value={adminData.email} onChange={handleOnchange} type="email" id='e-mail' className="border border-gray-400 rounded-md mt-1 w-full py-3 px-5 text-sm font-semibold" placeholder="E.g. Jame@gmail.com" required />
                        </div>
                        <div className='flex flex-col items-start justify-center mb-3'>
                            <label htmlFor="password" className='text-sm font-semibold tracking-wide'>Password</label>
                            <input name='password' value={adminData.password} onChange={handleOnchange} type="password" id="password" minLength={isSignUp === 'sign-up' ? 8 : undefined} className="border border-gray-400 rounded-md mt-1 w-full py-3 px-5 text-sm font-semibold" placeholder="E.g. Jame@123" required />
                        </div>

                        <button type='submit' disabled={loading} className='w-full bg-black rounded-2xl text-center py-4 mt-5 text-white font-semibold uppercase flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed'>
                            {!loading
                                ? (`${isSignUp.replace("-", " ")}`) : (
                                    <Spinner />
                                )
                            }
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default LoginScreen