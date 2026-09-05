"use client";
import { Spinner } from "@/components/ui/spinner";
import axios from "axios";
import React, {
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import toast from "react-hot-toast";
import { Context } from "../context/Context";

const AddProduct = () => {
    const { url } = useContext(Context);

    const [productData, setProductData] = useState({
        _id: "",
        name: "",
        category: "",
        subcategory: "",
        description: "",
        price: "",
        sizes: [],
        images: [],
        bestseller: false,
    });

    const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
    const [loading, setLoading] = useState(false);

    const fileInputRef = useRef(null);

    const handleOnchange = (e) => {
        const { name, value } = e.target;

        setProductData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleSizeToggle = (size) => {
        setProductData((prev) => {
            const hasSize = prev.sizes.some((item) => item.size === size);

            return {
                ...prev,
                sizes: hasSize
                    ? prev.sizes.filter((item) => item.size !== size)
                    : [...prev.sizes, { size, stock: 0 }],
            };
        });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files || []);

        if (files.length === 0) return;

        if (files.length > 5) {
            toast.error("You can upload maximum 5 images.");
            return;
        }

        setProductData((prev) => ({
            ...prev,
            images: files,
        }));

        const previewUrls = files.map((file) =>
            URL.createObjectURL(file)
        );

        setImagePreviewUrls(previewUrls);
    };

    useEffect(() => {
        return () => {
            imagePreviewUrls.forEach((url) =>
                URL.revokeObjectURL(url)
            );
        };
    }, [imagePreviewUrls]);

    const resetForm = () => {
        setProductData({
            _id: "",
            name: "",
            category: "",
            subcategory: "",
            description: "",
            price: "",
            sizes: [],
            images: [],
            bestseller: false,
        });

        setImagePreviewUrls([]);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Frontend validation
        if (productData.images.length === 0) {
            toast.error("Please select at least one image.");
            return;
        }

        if (productData.sizes.length === 0) {
            toast.error("Please select at least one size.");
            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();

            formData.append("_id", productData._id)
            formData.append("name", productData.name);
            formData.append("category", productData.category);
            formData.append(
                "subcategory",
                productData.subcategory
            );
            formData.append(
                "description",
                productData.description
            );
            formData.append("price", productData.price);

            // Convert array to JSON
            formData.append(
                "sizes",
                JSON.stringify(productData.sizes)
            );

            formData.append(
                "bestseller",
                productData.bestseller
            );

            // Add multiple images
            productData.images.forEach((image) => {
                formData.append("images", image);
            });

            const response = await axios.post(
                `${url}/api/product/add-product`,
                formData
            );

            if (response.data.success) {
                toast.success("Product added successfully.");

                resetForm();
            } else {
                toast.error(
                    response.data.message ||
                    "Product not added."
                );
            }
        } catch (error) {
            console.log("ADD PRODUCT ERROR:", error);

            toast.error(
                error.response?.data?.message ||
                "Product not added."
            );
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <Spinner className="size-8" />
            </div>
        );
    }

    return (
        <div>
            <div>
                <h1 className="text-black font-medium text-lg tracking-wide">
                    Add Product
                </h1>

                <p className="text-gray-400 text-sm">
                    Create a new item for the store.
                </p>
            </div>

            <form
                className="mt-5"
                onSubmit={handleSubmit}
            >
                {/* Images */}
                <div className="flex flex-col gap-2">
                    <label
                        className="text-gray-500"
                        htmlFor="image"
                    >
                        Upload images
                    </label>

                    <div
                        className="border border-dashed border-gray-400 w-fit p-4 flex items-center justify-center flex-col gap-3 text-gray-400 cursor-pointer hover:border-black hover:text-black"
                        onClick={handleImageClick}
                    >
                        {imagePreviewUrls.length > 0 ? (
                            <div className="flex flex-wrap gap-3 max-w-[600px]">
                                {imagePreviewUrls.map(
                                    (preview, index) => (
                                        <div
                                            key={preview}
                                            className="w-32"
                                        >
                                            <img
                                                src={preview}
                                                alt={`Preview ${index + 1
                                                    }`}
                                                className="h-32 w-32 object-cover"
                                            />

                                            <p className="text-xs mt-1 truncate">
                                                {
                                                    productData
                                                        .images[
                                                        index
                                                    ]?.name
                                                }
                                            </p>
                                        </div>
                                    )
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center flex-col px-5">
                                <p className="uppercase text-xl -rotate-90 tracking-widest">
                                    <i className="bx bx-arrow-out-right-square-half"></i>
                                </p>

                                <p className="text-md tracking-wider">
                                    Image
                                </p>
                            </div>
                        )}
                    </div>

                    <input
                        type="file"
                        id="image"
                        hidden
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/*"
                        multiple
                    />
                </div>
                {/* product id */}
                <div className="mt-5 flex flex-col items-start gap-2">
                    <label
                        htmlFor="product-id"
                        className="text-[15px] text-gray-500"
                    >
                        Product id
                    </label>

                    <input
                        name="_id"
                        value={productData._id}
                        onChange={handleOnchange}
                        required
                        type="text"
                        id="product-id"
                        placeholder="Type here"
                        className="border border-gray-300 outline-none max-sm:w-full px-5 py-2 placeholder:text-sm text-sm focus:border-black"
                    />
                </div>

                {/* Product Name */}
                <div className="mt-5 flex flex-col items-start gap-2">
                    <label
                        htmlFor="product-name"
                        className="text-[15px] text-gray-500"
                    >
                        Product name
                    </label>

                    <input
                        name="name"
                        value={productData.name}
                        onChange={handleOnchange}
                        required
                        type="text"
                        id="product-name"
                        placeholder="Type here"
                        className="border border-gray-300 outline-none max-sm:w-full px-5 py-2 placeholder:text-sm text-sm focus:border-black"
                    />
                </div>

                {/* Description */}
                <div className="mt-5 flex flex-col items-start gap-2">
                    <label
                        htmlFor="description"
                        className="text-[15px] text-gray-500"
                    >
                        Product description
                    </label>

                    <textarea
                        name="description"
                        value={productData.description}
                        onChange={handleOnchange}
                        required
                        cols={50}
                        rows={5}
                        id="description"
                        placeholder="Write content here"
                        className="border border-gray-300 outline-none max-sm:w-full px-5 py-2 placeholder:text-sm text-sm focus:border-black"
                    />
                </div>

                {/* Category */}
                <div className="mt-5 flex flex-col items-start gap-2">
                    <label
                        htmlFor="category"
                        className="text-[15px] text-gray-500"
                    >
                        Category
                    </label>

                    <select
                        name="category"
                        value={productData.category}
                        onChange={handleOnchange}
                        required
                        id="category"
                        className="border border-gray-300 outline-none px-5 py-2 text-sm focus:border-black"
                    >
                        <option value="">
                            Select category
                        </option>

                        <option value="men">Men</option>
                        <option value="women">Women</option>
                        <option value="kids">Kids</option>
                    </select>
                </div>

                {/* Subcategory */}
                <div className="mt-5 flex flex-col items-start gap-2">
                    <label
                        htmlFor="subcategory"
                        className="text-[15px] text-gray-500"
                    >
                        Sub category
                    </label>

                    <select
                        name="subcategory"
                        value={productData.subcategory}
                        onChange={handleOnchange}
                        required
                        id="subcategory"
                        className="border border-gray-300 outline-none px-5 py-2 text-sm focus:border-black"
                    >
                        <option value="">
                            Select subcategory
                        </option>

                        <option value="topwear">
                            Topwear
                        </option>

                        <option value="bottomwear">
                            Bottomwear
                        </option>

                        <option value="winterwear">
                            Winterwear
                        </option>
                    </select>
                </div>

                {/* Price */}
                <div className="mt-5 flex flex-col items-start gap-2">
                    <label
                        htmlFor="price"
                        className="text-[15px] text-gray-500"
                    >
                        Price
                    </label>

                    <input
                        name="price"
                        value={productData.price}
                        onChange={handleOnchange}
                        required
                        min="0"
                        type="number"
                        id="price"
                        placeholder="25"
                        className="border border-gray-300 outline-none w-32 px-5 py-2 placeholder:text-sm text-sm focus:border-black"
                    />
                </div>

                {/* Sizes */}
                <div className="mt-5 flex flex-col items-start gap-2">
                    <label
                        htmlFor="product-sizes"
                        className="text-[15px] text-gray-500"
                    >
                        Product sizes
                    </label>

                    <div className="flex items-center gap-3">
                        {["S", "M", "L", "XL", "XXL"].map(
                            (size) => {
                                const selected = productData.sizes.some((item) => item.size === size);

                                return (
                                    <div key={size} className="flex items-center gap-2">
                                        <button type="button" onClick={() => handleSizeToggle(size)} className={`px-4 py-2 cursor-pointer transition-all duration-300 ${selected ? "bg-red-100 text-red-800" : "bg-gray-400/20 text-gray-500"}`}>
                                            {size}
                                        </button>
                                        {selected && (
                                            <input
                                                type="number"
                                                min="0"
                                                value={productData.sizes.find((item) => item.size === size)?.stock ?? 0}
                                                onChange={(e) => setProductData((prev) => ({
                                                    ...prev,
                                                    sizes: prev.sizes.map((item) => item.size === size ? { ...item, stock: Number(e.target.value) } : item),
                                                }))}
                                                className="w-16 border border-gray-300 px-2 py-2 text-sm"
                                                aria-label={`${size} stock`}
                                            />
                                        )}
                                    </div>
                                );
                            }
                        )}
                    </div>
                </div>

                {/* Bestseller */}
                <div className="flex items-center my-4 gap-2">
                    <input
                        name="bestseller"
                        checked={
                            productData.bestseller
                        }
                        onChange={(e) =>
                            setProductData((prev) => ({
                                ...prev,
                                bestseller:
                                    e.target.checked,
                            }))
                        }
                        type="checkbox"
                        id="bestseller"
                    />

                    <label
                        htmlFor="bestseller"
                        className="text-sm text-gray-400"
                    >
                        Add to bestseller
                    </label>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className="mt-4 bg-black text-white w-32 py-3 uppercase tracking-widest text-[11px] cursor-pointer disabled:opacity-50"
                >
                    {loading ? "Adding..." : "Add"}
                </button>
            </form>
        </div>
    );
};

export default AddProduct;