"use client";

import React, { useContext, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import axios from "axios";
import toast from "react-hot-toast";
import { Box, Pencil, Search, Trash2 } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const categories = ["men", "women", "kids"];

const ProductSkeleton = () => (
  <div className="space-y-3" aria-label="Loading products" role="status">
    {Array.from({ length: 5 }).map((_, index) => (
      <div
        key={index}
        className="flex items-center gap-4 rounded-lg border p-4"
      >
        <Skeleton className="size-14 rounded-md" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-64" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
    ))}
  </div>
);

const ProductThumbnail = ({ product, url }) => (
  <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-gray-100 ring-1 ring-gray-200">
    {product.images?.[0] ? (
      <Image
        src={`${url}/images/${product.images[0]}`}
        fill
        sizes="56px"
        alt={product.name}
        className="object-cover"
        unoptimized
      />
    ) : (
      <Box
        className="absolute inset-0 m-auto size-5 text-gray-300"
        aria-hidden="true"
      />
    )}
  </div>
);
const StockBadges = ({ product }) => (
  <div className="flex flex-wrap gap-1">
    {(product.sizes || []).map((item) => (
      <Badge key={item.size || item} variant="outline" className="text-[10px]">
        {item.size || item}: {item.stock ?? 0}
      </Badge>
    ))}
  </div>
);
const DeleteButton = ({ product, deletingId, onDelete }) => (
  <Button
    type="button"
    variant="ghost"
    size="icon"
    disabled={deletingId === product._id}
    onClick={(event) => {
      event.stopPropagation();
      onDelete(product);
    }}
    aria-label={`Delete ${product.name}`}
    className="text-gray-500 hover:bg-red-50 hover:text-red-600"
  >
    <Trash2 className="size-4" />
  </Button>
);

const ProductList = () => {
  const { url } = useContext(Context);
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("men");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");
  const [productToDelete, setProductToDelete] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleFetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(url + "/api/product/list-product");
      if (response.data.success) setProducts(response.data.data);
      else toast.error(response.data.message || "Failed to load products.");
    } catch (error) {
      console.log(error);
      toast.error("Products fetch failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    handleFetchProducts();
    // handleFetchProducts owns the async state updates and is intentionally invoked when the API URL is ready.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  const filterProducts = useMemo(
    () =>
      products.filter((p) => {
        const matchesCategory = (p.category || "").toLowerCase() === category;
        const matchesSearch = (p.name || "")
          .toLowerCase()
          .includes(search.toLowerCase().trim());
        return matchesCategory && matchesSearch;
      }),
    [products, category, search],
  );

  const handleDelete = async (productId) => {
    if (!productId || deletingId) return;
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      toast.error("Please login again");
      return;
    }
    setDeletingId(productId);
    try {
      const res = await axios.post(
        url + "/api/product/remove-product",
        { id: productId },
        { headers: { Authorization: `Bearer ${adminToken}` } },
      );
      if (res.data.success) {
        setProducts((prev) => prev.filter((p) => p._id !== productId));
        toast.success("Product removed");
      } else toast.error(res.data.message || "Failed to remove product");
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to remove product");
    } finally {
      setDeletingId(null);
      setProductToDelete(null);
    }
  };

  return (
    <div className="w-full pb-8">
      <Card>
        <CardHeader className="gap-4 border-b sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-gray-400">
              Catalogue
            </p>
            <CardTitle>All products</CardTitle>
            <CardDescription>
              {filterProducts.length} item
              {filterProducts.length !== 1 ? "s" : ""} shown · {products.length}{" "}
              total
            </CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-3 top-2.5 size-4 text-gray-400"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products"
              aria-label="Search products"
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={category} onValueChange={setCategory}>
            <div className="overflow-x-auto border-b px-5 py-2">
              <TabsList className="h-12 bg-transparent">
                <TabsTrigger className="px-4 py-3" value="men">
                  Men
                </TabsTrigger>
                <TabsTrigger className="px-4 py-3" value="women">
                  Women
                </TabsTrigger>
                <TabsTrigger className="px-4 py-3" value="kids">
                  Kids
                </TabsTrigger>
              </TabsList>
            </div>
            {categories.map((tab) => (
              <TabsContent key={tab} value={tab} className="m-0 p-5">
                {loading ? (
                  <ProductSkeleton />
                ) : filterProducts.length === 0 ? (
                  <div className="flex min-h-56 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-200 bg-gray-50/60 text-center">
                    <Box className="size-8 text-gray-300" />
                    <p className="text-sm font-medium text-gray-600">
                      No products found
                    </p>
                    <p className="text-xs text-gray-400">
                      Try another category or search term.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="hidden overflow-x-auto sm:block">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Sizes & stock</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filterProducts.map((product) => (
                            <TableRow
                              key={product._id}
                              onClick={() => setSelectedProduct(product)}
                              className="cursor-pointer"
                            >
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <ProductThumbnail
                                    product={product}
                                    url={url}
                                  />
                                  <div className="min-w-0">
                                    <p className="truncate font-medium">
                                      {product.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {product._id}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <p className="capitalize">{product.category}</p>
                                <p className="text-xs capitalize text-gray-500">
                                  {product.subcategory}
                                </p>
                              </TableCell>
                              <TableCell>
                                <StockBadges product={product} />
                              </TableCell>
                              <TableCell>
                                {product.bestseller ? (
                                  <Badge className="bg-emerald-600 hover:bg-emerald-600">
                                    Bestseller
                                  </Badge>
                                ) : (
                                  <span className="text-xs text-gray-400">
                                    Standard
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <DeleteButton
                                  product={product}
                                  deletingId={deletingId}
                                  onDelete={setProductToDelete}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="space-y-3 sm:hidden">
                      {filterProducts.map((product) => (
                        <div
                          key={product._id}
                          onClick={() => setSelectedProduct(product)}
                          className="flex cursor-pointer items-start gap-3 rounded-lg border p-3"
                        >
                          <ProductThumbnail product={product} url={url} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="truncate text-sm font-medium">
                                  {product.name}
                                </p>
                                <p className="text-xs capitalize text-gray-500">
                                  {product.category} · {product.subcategory}
                                </p>
                              </div>
                              <DeleteButton
                                product={product}
                                deletingId={deletingId}
                                onDelete={setProductToDelete}
                              />
                            </div>
                            <div className="mt-3">
                              <StockBadges product={product} />
                            </div>
                            {product.bestseller && (
                              <Badge className="mt-2 bg-emerald-600 hover:bg-emerald-600">
                                Bestseller
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <AlertDialog
        open={Boolean(productToDelete)}
        onOpenChange={(open) => !open && setProductToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {productToDelete?.name}? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={Boolean(deletingId)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={Boolean(deletingId)}
              onClick={() => handleDelete(productToDelete?._id)}
              className="bg-red-600 hover:bg-red-700"
            >
              {deletingId ? "Deleting..." : "Delete product"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={Boolean(selectedProduct)}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="size-4" />
              Edit product
            </DialogTitle>
            <DialogDescription>
              Product editing is ready for the existing update endpoint. This
              view currently shows the selected record without changing the
              existing product API flow.
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <ProductThumbnail product={selectedProduct} url={url} />
                <div>
                  <p className="font-medium">{selectedProduct.name}</p>
                  <p className="text-xs text-gray-500">{selectedProduct._id}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Category</p>
                  <p className="capitalize">
                    {selectedProduct.category} / {selectedProduct.subcategory}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Price</p>
                  <p>${selectedProduct.price}</p>
                </div>
              </div>
              <StockBadges product={selectedProduct} />
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedProduct(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductList;
