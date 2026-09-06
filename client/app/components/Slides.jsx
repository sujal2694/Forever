"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
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
    const [isPaused, setIsPaused] = useState(false);
    const touchStartX = useRef(null);

    // Auto Slide
    useEffect(() => {
        if (isPaused) return undefined;
        const interval = setInterval(() => {
            setCurrent((prev) => prev + 1);
        }, 4000);

        return () => clearInterval(interval);
    }, [isPaused]);

    const nextSlide = () => {
        setCurrent((prev) => prev + 1);
    };

    const prevSlide = () => {
        setCurrent((prev) => prev - 1);
    };

    const handleTouchStart = (event) => {
        touchStartX.current = event.touches[0].clientX;
    };

    const handleTouchEnd = (event) => {
        if (touchStartX.current === null) return;

        const distance = event.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(distance) > 45) {
            if (distance < 0) nextSlide();
            else prevSlide();
        }
        touchStartX.current = null;
    };

    const handleKeyDown = (event) => {
        if (event.key === "ArrowLeft") prevSlide();
        if (event.key === "ArrowRight") nextSlide();
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
        <section
            aria-label="Featured collections"
            tabIndex="0"
            onKeyDown={handleKeyDown}
            onFocus={() => setIsPaused(true)}
            onBlur={() => setIsPaused(false)}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="relative mx-auto mt-34 mb-40 w-[95vw] touch-pan-y overflow-hidden rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-black/40 lg:w-[85vw]"
        >
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
                        <div className="flex min-h-[430px] border border-gray-700 max-sm:min-h-0 max-sm:flex-col">
                            {/* Left */}
                            <div className="flex w-1/2 items-center justify-center px-8 py-12 max-sm:w-full max-sm:px-5">
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2.5">
                                        <hr className="w-12 h-[2px] bg-black border-none" />
                                        <span>{slide.subtitle}</span>
                                    </div>

                                    <h1 className="text-5xl my-5">{slide.title}</h1>

                                    <Link href="/collection" className="group inline-flex items-center gap-2.5 rounded-sm py-2 pr-2 text-sm font-medium uppercase tracking-widest transition hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black/30" aria-label={`Shop ${slide.title}`}>
                                        <span>Shop Now</span>
                                        <hr className="w-12 h-[2px] bg-black border-none" />
                                    </Link>
                                </div>
                            </div>

                            {/* Right */}
                            <div className="group w-1/2 max-sm:w-full">
                                <Image
                                    src={slide.image}
                                    alt={slide.title}
                                    className="h-[40vw] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 max-sm:h-[80vw]"
                                    priority
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Prev */}
            <button
                type="button"
                onClick={prevSlide}
                aria-label="Previous featured collection"
                className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-black sm:left-5"
            >
                <span aria-hidden="true">❮</span>
            </button>

            {/* Next */}
            <button
                type="button"
                onClick={nextSlide}
                aria-label="Next featured collection"
                className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-black sm:right-5"
            >
                <span aria-hidden="true">❯</span>
            </button>

            {/* Dots */}
            <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2 rounded-full bg-white/80 px-3 py-2 backdrop-blur-sm">
                {slides.map((_, index) => (
                    <button
                        type="button"
                        key={index}
                        onClick={() => setCurrent(index + 1)}
                        aria-label={`Go to featured collection ${index + 1}`}
                        aria-current={current === index + 1 ? "true" : undefined}
                        className={`h-2.5 rounded-full transition-all duration-300 ${current === index + 1
                            ? "w-8 bg-black"
                            : "w-2.5 bg-gray-300 hover:bg-gray-500"
                            }`}
                    />
                ))}
            </div>
        </section>
    );
}