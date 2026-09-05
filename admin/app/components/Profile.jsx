import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react'
import { Context } from '../context/Context';

const Profile = () => {
    const { url, token } = useContext(Context);
    const [admin, setAdmin] = useState(null);

    useEffect(() => {
        const fetchAdmin = async () => {
            if (!token) return;

        try {
                const res = await axios.get(url + "/api/admin/profile", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.data.success) {
                    setAdmin(res.data.admin);
                }
        } catch (error) {
            console.error("Unable to fetch admin profile", error);
        }
        };

        fetchAdmin();
    }, [token, url]);

    return (
        <div>
            <h1 className='text-2xl tracking-wider'>Profile</h1>
            <p className='text-xs tracking-wider text-gray-400 font-mono'>Check your details here.</p>

            <div className='w-full mt-10 px-1 sm:px-3'>
                <div className='w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'>
                    <div className='min-w-0 flex items-start flex-col gap-2 border border-zinc-800 pb-3 rounded-sm'>
                        <span className='text-sm text-gray-600 tracking-wider font-semibold border-b border-zinc-600 w-full px-4 sm:px-5 py-3'>Organization Name</span>
                        <p className='w-full px-4 sm:px-5 text-sm tracking-wider text-black font-mono wrap-break-word'>{admin?.orgname || 'Loading...'}</p>
                    </div>
                    <div className='min-w-0 flex items-start flex-col gap-2 border border-zinc-800 pb-3 rounded-sm'>
                        <span className='text-sm text-gray-600 tracking-wider font-semibold border-b border-zinc-600 w-full px-4 sm:px-5 py-3'>Owner Name</span>
                        <p className='w-full px-4 sm:px-5 text-sm tracking-wider text-black font-mono wrap-break-word'>{admin?.ownname || 'Loading...'}</p>
                    </div>
                    <div className='min-w-0 flex items-start flex-col gap-2 border border-zinc-800 pb-3 rounded-sm'>
                        <span className='text-sm text-gray-600 tracking-wider font-semibold border-b border-zinc-600 w-full px-4 sm:px-5 py-3'>Email</span>
                        <p className='w-full px-4 sm:px-5 text-sm tracking-wider text-black font-mono wrap-break-word'>{admin?.email || 'Loading...'}</p>
                    </div>
                    <div className='min-w-0 flex items-start flex-col gap-2 border border-zinc-800 pb-3 rounded-sm'>
                        <span className='text-sm text-gray-600 tracking-wider font-semibold border-b border-zinc-600 w-full px-4 sm:px-5 py-3'>Phone</span>
                        <p className='w-full px-4 sm:px-5 text-sm tracking-wider text-black font-mono wrap-break-word'>{admin?.number || 'Loading...'}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile
