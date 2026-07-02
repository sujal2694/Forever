
const Subscripation = () => {
    return (
        <div className="w-full fade-in">
            <div className="w-full mb-40">
                <div className="flex items-center justify-center flex-col w-[85vw] lg:w-[80vw] m-auto ">
                    <h1 className="text-2xl font-semibold mb-3">Subscribe now & get 20% off</h1>
                    <p className="text-lg text-gray-400 text-center mb-4">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Totam.</p>
                    <div className="lg:w-[40vw] md:w-[40vw] h-12 flex items-center">
                        <input className="w-full border border-gray-300 border-r-0 h-full px-4 text-sm" type="text" placeholder="Enter your email" />
                        <button className="bg-black text-white text-xs uppercase h-full px-9 hover:bg-transparent hover:text-black cursor-pointer hover:ring-2 hover:ring-black transition-all duration-150">subscribe</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Subscripation
