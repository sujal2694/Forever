"use client"
import { useState } from "react"
import Image from "next/image"
import Navbar from "../components/Navbar"
import Subscription from "../components/Subscription"
import Footer from "../components/Footer"
import { assets } from "../assets/assets"

const values = [
    { title: "Quality assurance", number: "01", text: "We meticulously select and vet each product to ensure it meets our high standards before it reaches you." },
    { title: "Effortless shopping", number: "02", text: "From discovery to delivery, every detail is designed to make finding something special feel simple." },
    { title: "Real support", number: "03", text: "Our dedicated team is here to help with thoughtful, human service whenever you need us." },
]

const About = () => {
    const [activeValue, setActiveValue] = useState(0)

    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <main className="mx-auto w-full max-w-7xl px-4 pb-8 pt-28 sm:px-6 lg:px-8 lg:pt-36 fade-in">
                <section className="grid items-end gap-8 border-b border-gray-200 pb-12 lg:grid-cols-[1.1fr_0.9fr] lg:pb-20">
                    <div>
                        <p className="mb-4 text-xs font-medium uppercase tracking-[0.28em] text-gray-400">The Forever story</p>
                        <h1 className="max-w-3xl text-4xl font-medium leading-tight tracking-tight text-gray-900 sm:text-6xl">Thoughtful style, made for every day.</h1>
                    </div>
                    <p className="max-w-md text-sm leading-7 text-gray-500 sm:text-base lg:justify-self-end">Forever brings together considered pieces and an easier way to shop them. We believe good design should feel personal, practical, and lasting.</p>
                </section>

                <section className="grid gap-10 py-12 sm:py-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-20 lg:py-24" aria-labelledby="story-title">
                    <div className="aspect-4/3 overflow-hidden bg-gray-100 sm:aspect-16/10 lg:aspect-4/3">
                        <Image className="h-full w-full object-cover" src={assets.about_img} alt="A curated Forever fashion collection" loading="eager" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <p className="mb-3 text-xs font-medium uppercase tracking-[0.24em] text-gray-400">A little more about us</p>
                        <h2 id="story-title" className="text-3xl font-medium tracking-tight text-gray-900 sm:text-4xl">Made with curiosity. Chosen with care.</h2>
                        <div className="mt-6 space-y-5 text-sm leading-7 text-gray-500 sm:text-base">
                            <p>Forever began with a simple idea: create a place where discovering something new feels easy, considered, and enjoyable.</p>
                            <p>We curate versatile pieces from trusted makers, balancing quality with the small details that make an everyday favourite feel like your own.</p>
                        </div>
                        <div className="mt-8 border-l-2 border-black pl-5 text-sm font-medium leading-6 text-gray-800">Our mission is to give you choice, confidence, and a shopping experience worth returning to.</div>
                    </div>
                </section>

                <section className="border-y border-gray-200 py-12 sm:py-16" aria-labelledby="values-title">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="mb-3 text-xs font-medium uppercase tracking-[0.24em] text-gray-400">What matters to us</p>
                            <h2 id="values-title" className="text-3xl font-medium tracking-tight text-gray-900 sm:text-4xl">Why choose Forever?</h2>
                        </div>
                        <p className="max-w-sm text-sm leading-6 text-gray-500">The principles behind every product, page, and conversation.</p>
                    </div>

                    <div className="mt-10 grid gap-px overflow-hidden border border-gray-200 bg-gray-200 md:grid-cols-3">
                        {values.map((value, index) => {
                            const isActive = activeValue === index
                            return (
                                <button key={value.title} type="button" aria-expanded={isActive} onClick={() => setActiveValue(index)} className={`min-h-56 p-6 text-left transition sm:p-8 ${isActive ? "bg-black text-white" : "bg-white text-gray-900 hover:bg-gray-50"}`}>
                                    <span className="text-xs font-medium tracking-[0.2em] text-gray-400">{value.number}</span>
                                    <span className="mt-14 block text-lg font-medium">{value.title}</span>
                                    <span className={`mt-3 block text-sm leading-6 ${isActive ? "text-gray-300" : "text-gray-500"}`}>{value.text}</span>
                                </button>
                            )
                        })}
                    </div>
                    <p className="mt-4 text-xs text-gray-400">Select a value to explore what it means in practice.</p>
                </section>

                <section className="py-12 sm:py-16 lg:py-20">
                    <Subscription />
                </section>
                <Footer />
            </main>
        </div>
    )
}

export default About
