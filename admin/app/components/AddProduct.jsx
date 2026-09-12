"use client";

import { LoaderCircle, ImagePlus, X, PackagePlus } from "lucide-react";
import axios from "axios";
import Image from "next/image";
import React, { useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Context } from "../context/Context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const sizes = ["S", "M", "L", "XL", "XXL"];
const categories = ["men", "women", "kids"];
const subcategories = ["topwear", "bottomwear", "winterwear"];

const AddProduct = () => {
  const { url, token } = useContext(Context);

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
  const [validationErrors, setValidationErrors] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const handleOnchange = (e) => {
    const { name, value } = e.target;
    setProductData((prev) => ({ ...prev, [name]: value }));
    setValidationErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageClick = () => fileInputRef.current?.click();

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
    setValidationErrors((prev) => ({ ...prev, sizes: "" }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (productData.images.length + files.length > 5) {
      toast.error("You can upload maximum 5 images.");
      return;
    }
    setProductData((prev) => ({ ...prev, images: [...prev.images, ...files] }));
    setImagePreviewUrls((prev) => [
      ...prev,
      ...files.map((file) => URL.createObjectURL(file)),
    ]);
    setValidationErrors((prev) => ({ ...prev, images: "" }));
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(imagePreviewUrls[index]);
    setProductData((prev) => ({
      ...prev,
      images: prev.images.filter((_, imageIndex) => imageIndex !== index),
    }));
    setImagePreviewUrls((prev) =>
      prev.filter((_, imageIndex) => imageIndex !== index),
    );
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleImageChange({ target: { files: e.dataTransfer.files } });
  };

  useEffect(
    () => () =>
      imagePreviewUrls.forEach((preview) => URL.revokeObjectURL(preview)),
    [imagePreviewUrls],
  );

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
    setValidationErrors({});
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (productData.images.length === 0)
      errors.images = "Add at least one product image.";
    if (productData.sizes.length === 0)
      errors.sizes = "Select at least one size.";
    if (!productData._id.trim()) errors._id = "Product ID is required.";
    if (!productData.name.trim()) errors.name = "Product name is required.";
    if (!productData.description.trim())
      errors.description = "Description is required.";
    if (!productData.category) errors.category = "Choose a category.";
    if (!productData.subcategory) errors.subcategory = "Choose a subcategory.";
    if (!productData.price || Number(productData.price) < 0)
      errors.price = "Enter a valid price.";
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("_id", productData._id);
      formData.append("name", productData.name);
      formData.append("category", productData.category);
      formData.append("subcategory", productData.subcategory);
      formData.append("description", productData.description);
      formData.append("price", productData.price);
      formData.append("sizes", JSON.stringify(productData.sizes));
      formData.append("bestseller", productData.bestseller);
      productData.images.forEach((image) => formData.append("images", image));

      const response = await axios.post(
        `${url}/api/product/add-product`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (response.data.success) {
        toast.success("Product added successfully.");
        resetForm();
      } else {
        toast.error(response.data.message || "Product not added.");
      }
    } catch (error) {
      console.log("ADD PRODUCT ERROR:", error);
      toast.error(error.response?.data?.message || "Product not added.");
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = (field) =>
    validationErrors[field] ? "border-red-400 focus-visible:ring-red-200" : "";

  return (
    <div className="w-full pb-8 p-3">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-gray-400">
            Catalogue
          </p>
          <h1 className="text-2xl font-medium tracking-tight">Add product</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create a new item for the store.
          </p>
        </div>
        <Badge variant="outline" className="hidden sm:inline-flex">
          {productData.images.length} / 5 images
        </Badge>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
            <CardDescription>Upload up to five product images.</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              onClick={handleImageClick}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              className={`rounded-lg border-2 border-dashed p-5 transition ${isDragging ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-400"}`}
            >
              {imagePreviewUrls.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {imagePreviewUrls.map((preview, index) => (
                    <div
                      key={preview}
                      className="group relative size-24 overflow-hidden rounded-md bg-gray-100 ring-1 ring-gray-200"
                    >
                      <Image
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        fill
                        sizes="96px"
                        unoptimized
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(index);
                        }}
                        aria-label={`Remove image ${index + 1}`}
                        className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-black/75 text-white opacity-0 transition group-hover:opacity-100"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ))}
                  {productData.images.length < 5 && (
                    <button
                      type="button"
                      onClick={handleImageClick}
                      className="flex size-24 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-gray-300 text-gray-400 hover:text-black"
                    >
                      <ImagePlus className="size-5" />
                      <span className="text-[10px]">Add more</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex min-h-32 flex-col items-center justify-center gap-2 text-center text-gray-500">
                  <ImagePlus className="size-7" />
                  <p className="text-sm font-medium">
                    Drop images here or click to browse
                  </p>
                  <p className="text-xs text-gray-400">
                    PNG, JPG up to 5 images
                  </p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              id="image"
              hidden
              onChange={handleImageChange}
              accept="image/*"
              multiple
            />
            {validationErrors.images && (
              <p className="mt-2 text-xs text-red-600">
                {validationErrors.images}
              </p>
            )}
            <p className="mt-2 text-xs text-gray-400 sm:hidden">
              {productData.images.length} / 5 images
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-5 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
              <CardDescription>
                Give the product a clear identity.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="product-id" className="text-sm font-medium">
                  Product ID
                </label>
                <Input
                  id="product-id"
                  name="_id"
                  value={productData._id}
                  onChange={handleOnchange}
                  placeholder="forever-001"
                  className={fieldClass("_id")}
                />
                {validationErrors._id && (
                  <p className="text-xs text-red-600">{validationErrors._id}</p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="product-name" className="text-sm font-medium">
                  Product name
                </label>
                <Input
                  id="product-name"
                  name="name"
                  value={productData.name}
                  onChange={handleOnchange}
                  placeholder="Essential cotton shirt"
                  className={fieldClass("name")}
                />
                {validationErrors.name && (
                  <p className="text-xs text-red-600">
                    {validationErrors.name}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={productData.description}
                  onChange={handleOnchange}
                  placeholder="Describe the fit, material, and feel."
                  rows={5}
                  className={fieldClass("description")}
                />
                {validationErrors.description && (
                  <p className="text-xs text-red-600">
                    {validationErrors.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-5">
            <Card>
              <CardHeader>
                <CardTitle>Category</CardTitle>
                <CardDescription>
                  Help customers find this item.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={productData.category}
                    onValueChange={(value) => {
                      setProductData((prev) => ({ ...prev, category: value }));
                      setValidationErrors((prev) => ({
                        ...prev,
                        category: "",
                      }));
                    }}
                  >
                    <SelectTrigger className={fieldClass("category")}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category[0].toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.category && (
                    <p className="text-xs text-red-600">
                      {validationErrors.category}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subcategory</label>
                  <Select
                    value={productData.subcategory}
                    onValueChange={(value) => {
                      setProductData((prev) => ({
                        ...prev,
                        subcategory: value,
                      }));
                      setValidationErrors((prev) => ({
                        ...prev,
                        subcategory: "",
                      }));
                    }}
                  >
                    <SelectTrigger className={fieldClass("subcategory")}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories.map((subcategory) => (
                        <SelectItem key={subcategory} value={subcategory}>
                          {subcategory[0].toUpperCase() + subcategory.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.subcategory && (
                    <p className="text-xs text-red-600">
                      {validationErrors.subcategory}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Pricing & sizes</CardTitle>
                <CardDescription>
                  Set price and available stock by size.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="max-w-xs space-y-2">
                  <label htmlFor="price" className="text-sm font-medium">
                    Price
                  </label>
                  <Input
                    id="price"
                    name="price"
                    value={productData.price}
                    onChange={handleOnchange}
                    min="0"
                    type="number"
                    placeholder="25"
                    className={fieldClass("price")}
                  />
                  {validationErrors.price && (
                    <p className="text-xs text-red-600">
                      {validationErrors.price}
                    </p>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      Available sizes
                    </label>
                    <span className="text-xs text-gray-400">
                      Select to add stock
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => {
                      const selected = productData.sizes.some(
                        (item) => item.size === size,
                      );
                      return (
                        <div key={size} className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleSizeToggle(size)}
                            className={`rounded-full border px-3 py-1.5 text-sm transition ${selected ? "border-black bg-black text-white" : "border-gray-200 text-gray-500 hover:border-gray-500"}`}
                          >
                            {size}
                          </button>
                          {selected && (
                            <Input
                              type="number"
                              min="0"
                              value={
                                productData.sizes.find(
                                  (item) => item.size === size,
                                )?.stock ?? 0
                              }
                              onChange={(e) =>
                                setProductData((prev) => ({
                                  ...prev,
                                  sizes: prev.sizes.map((item) =>
                                    item.size === size
                                      ? {
                                          ...item,
                                          stock: Number(e.target.value),
                                        }
                                      : item,
                                  ),
                                }))
                              }
                              className="h-8 w-16 px-2 text-center"
                              aria-label={`${size} stock`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {validationErrors.sizes && (
                    <p className="text-xs text-red-600">
                      {validationErrors.sizes}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Options</CardTitle>
            <CardDescription>
              Choose how this product appears in the catalogue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <div>
                <label htmlFor="bestseller" className="text-sm font-medium">
                  Feature as bestseller
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  Highlight this item in bestseller areas.
                </p>
              </div>
              <Switch
                id="bestseller"
                checked={productData.bestseller}
                onCheckedChange={(checked) =>
                  setProductData((prev) => ({ ...prev, bestseller: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading} className="min-w-36">
            {loading ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <PackagePlus className="size-4" />
                Add product
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
