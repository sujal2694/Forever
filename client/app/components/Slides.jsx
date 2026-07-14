"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { assets } from "../assets/assets";

const slides = [
    {
        title: "Latest Arrivals",
        subtitle: "Our Bestsellers",
        image: assets.hero_img_1,
    },
    {
        title: "New Collection",
        subtitle: "Trending Now",
        image: assets.hero_img_2,
    },
    {
        title: "For Kids",
        subtitle: "New Season",
        image: assets.hero_img_3,
    },
];

export default function HeroCarousel() {
    // Clone last and first slide
    const carouselSlides = [
        slides[slides.length - 1],
        ...slides,
        slides[0],
    ];
    const [current, setCurrent] = useState(1);
    const [transition, setTransition] = useState(true);

    // Auto Slide
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) => prev + 1);
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    const nextSlide = () => {
        setCurrent((prev) => prev + 1);
    };

    const prevSlide = () => {
        setCurrent((prev) => prev - 1);
    };

    // Reset position after reaching cloned slides
    const handleTransitionEnd = () => {
        if (current === carouselSlides.length - 1) {
            setTransition(false);
            setCurrent(1);
        }

        if (current === 0) {
            setTransition(false);
            setCurrent(slides.length);
        }
    };

    useEffect(() => {
        if (!transition) {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setTransition(true);
                });
            });
        }
    }, [transition]);

    return (
        <div className="relative w-[95vw] lg:w-[85vw] mx-auto mt-34 mb-40 overflow-hidden">
            {/* Slides */}
            <div
                className={`flex ${transition ? "transition-transform duration-700 ease-in-out" : ""
                    }`}
                style={{
                    transform: `translateX(-${current * 100}%)`,
                }}
                onTransitionEnd={handleTransitionEnd}
            >
                {carouselSlides.map((slide, index) => (
                    <div key={index} className="min-w-full">
                        <div className="flex border border-gray-700 max-sm:flex-col">
                            {/* Left */}
                            <div className="w-1/2 max-sm:w-full flex items-center justify-center">
                                <div>
                                    <div className="flex items-center gap-2.5">
                                        <hr className="w-12 h-[2px] bg-black border-none" />
                                        <span>{slide.subtitle}</span>
                                    </div>

                                    <h1 className="text-5xl my-5">{slide.title}</h1>

                                    <div className="flex items-center gap-2.5">
                                        <span>Shop Now</span>
                                        <hr className="w-12 h-[2px] bg-black border-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Right */}
                            <div className="w-1/2 max-sm:w-full">
                                <Image
                                    src={slide.image}
                                    alt={slide.title}
                                    className="w-full h-[40vw] object-cover"
                                    priority
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Prev */}
            <button
                onClick={prevSlide}
                className="absolute left-5 top-1/2 -translate-y-1/2 bg-white p-3 rounded-full shadow"
            >
                ❮
            </button>

            {/* Next */}
            <button
                onClick={nextSlide}
                className="absolute right-5 top-1/2 -translate-y-1/2 bg-white p-3 rounded-full shadow"
            >
                ❯
            </button>

            {/* Dots */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrent(index + 1)}
                        className={`h-3 rounded-full transition-all ${current === index + 1
                            ? "w-8 bg-black"
                            : "w-3 bg-gray-300"
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}