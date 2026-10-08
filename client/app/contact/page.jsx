"use client"
import React, { useContext, useState } from 'react'
import Navbar from '../components/Navbar'
import Image from 'next/image'
import { assets } from '../assets/assets'
import Subscription from '../components/Subscription'
import Footer from '../components/Footer'
import { Context } from '../context/Context'

const Contact = () => {
    const { subscriptionStatus } = useContext(Context);
    const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", email: "", message: "" });
    const [formState, setFormState] = useState("idle");

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((currentForm) => ({ ...currentForm, [name]: value }));
        if (formState !== "idle") setFormState("idle");
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setFormState("success");
        setForm({ firstName: "", lastName: "", phone: "", email: "", message: "" });
    };

    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <main className="mx-auto w-full max-w-7xl px-4 pb-8 pt-28 sm:px-6 lg:px-8 lg:pt-36 fade-in">
                <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
                    <p className="mb-3 text-xs font-medium uppercase tracking-[0.28em] text-gray-400">We are here to help</p>
                    <h1 className="text-4xl font-medium tracking-tight text-gray-900 sm:text-5xl">Let&apos;s talk.</h1>
                    <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">Have a question about an order, a product, or our stores? Send us a note and our team will get back to you within one business day.</p>
                </div>

                <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
                    <section className="flex flex-col justify-between" aria-labelledby="store-title">
                        <div>
                            <div className="aspect-4/3 overflow-hidden bg-gray-100 sm:aspect-16/10 lg:aspect-4/3">
                                <Image className="h-full w-full object-cover" src={assets.contact_img} alt="A detail from the Forever store" loading="eager" />
                            </div>
                            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
                                <div>
                                    <h2 id="store-title" className="text-xl font-medium text-gray-900">Visit our store</h2>
                                    <p className="mt-2 text-sm leading-6 text-gray-500">54709 Willms Station Suite 350<br />Washington, USA</p>
                                </div>
                                <div className="text-sm leading-7 text-gray-500">
                                    <a className="block transition hover:text-black" href="tel:+14155550132">Tel: (415) 555-0132</a>
                                    <a className="block transition hover:text-black" href="mailto:admin@forever.com">admin@forever.com</a>
                                    <p>Mon - Sat, 9:00 - 18:00</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="border-t border-gray-200 pt-8 lg:border-l lg:border-t-0 lg:pl-16 lg:pt-0" aria-labelledby="form-title">
                        <h2 id="form-title" className="text-2xl font-medium text-gray-900">Send us a message</h2>
                        <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
                            <div className="grid gap-5 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label htmlFor="firstName" className="text-sm font-medium text-gray-700">First name</label>
                                    <input id="firstName" name="firstName" type="text" autoComplete="given-name" required value={form.firstName} onChange={handleChange} placeholder="Your first name" className="h-12 w-full border border-gray-300 px-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-black/10" />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last name</label>
                                    <input id="lastName" name="lastName" type="text" autoComplete="family-name" required value={form.lastName} onChange={handleChange} placeholder="Your last name" className="h-12 w-full border border-gray-300 px-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-black/10" />
                                </div>
                            </div>
                            <div className="grid gap-5 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium text-gray-700">Email address</label>
                                    <input id="email" name="email" type="email" autoComplete="email" required value={form.email} onChange={handleChange} placeholder="you@example.com" className="h-12 w-full border border-gray-300 px-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-black/10" />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone <span className="font-normal text-gray-400">(optional)</span></label>
                                    <input id="phone" name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={handleChange} placeholder="(415) 555-0132" className="h-12 w-full border border-gray-300 px-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-black/10" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="message" className="text-sm font-medium text-gray-700">How can we help?</label>
                                <textarea id="message" name="message" rows={6} required value={form.message} onChange={handleChange} placeholder="Tell us a little about your question..." className="w-full resize-y border border-gray-300 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-black/10" />
                            </div>
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <p role="status" aria-live="polite" className={`min-h-5 text-sm ${formState === "success" ? "text-green-700" : "text-gray-500"}`}>
                                    {formState === "success" ? "Thanks. Your message is ready for our team." : "We usually reply within one business day."}
                                </p>
                                <button type="submit" className="h-12 shrink-0 bg-black px-8 text-xs font-medium uppercase tracking-wider text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2">Send message</button>
                            </div>
                        </form>
                    </section>
                </div>
                <div className="mb-8 mt-20 sm:mt-28">
                    {subscriptionStatus === "active" && <Subscription />}
                </div>
                <Footer />
            </main>
        </div>
    )
}

export default Contact
