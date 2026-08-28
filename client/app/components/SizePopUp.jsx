"use client"

export default function SizePopUp({ product, onSelect, onClose }) {
    const sizes = product?.sizes || ["S", "M", "L", "XL"]; // fallback if product has no sizes field

    return (
        <div onClick={onClose} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl p-6 w-72">
                <h3 className="font-semibold mb-4">{product.name} — Select Size</h3>
                <div className="grid grid-cols-4 gap-2 mb-4">
                    {sizes.map((size) => (
                        <button
                            key={size}
                            onClick={() => onSelect(size)}
                            className="border rounded-md py-2 text-sm hover:bg-gray-100"
                        >
                            {size}
                        </button>
                    ))}
                </div>
                <button onClick={onClose} className="text-sm text-gray-500 underline">
                    Cancel
                </button>
            </div>
        </div>
    );
}