"use client"

const normalizeSizes = (value) => {
    let parsed = value;

    if (typeof value === "string") {
        try {
            parsed = JSON.parse(value);
        } catch {
            parsed = [value];
        }
    }

    if (!Array.isArray(parsed)) return [];

    return parsed
        .map((entry) => ({
            size: typeof entry === "string" ? entry : entry?.size,
            stock: typeof entry === "string" || entry?.stock === undefined ? null : Number(entry.stock),
        }))
        .filter((entry) => entry.size);
};

export default function SizePopUp({ product, onSelect, onClose }) {
    const sizes = normalizeSizes(product?.sizes);
    const visibleSizes = sizes.length > 0 ? sizes : ["S", "M", "L", "XL"].map((size) => ({ size, stock: null }));

    return (
        <div onClick={onClose} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl p-6 w-72">
                <h3 className="font-semibold mb-4">{product.name} — Select Size</h3>
                <div className="grid grid-cols-4 gap-2 mb-4">
                    {visibleSizes.map(({ size, stock }) => {
                        const isOutOfStock = stock !== null && stock <= 0;
                        return (
                            <button
                                key={size}
                                onClick={() => onSelect(size)}
                                disabled={isOutOfStock}
                                className="border rounded-md py-2 text-sm hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {size} {isOutOfStock ? "(Out of stock)" : ""}
                            </button>
                        );
                    })}
                </div>
                <button onClick={onClose} className="text-sm text-gray-500 underline">
                    Cancel
                </button>
            </div>
        </div>
    );
}