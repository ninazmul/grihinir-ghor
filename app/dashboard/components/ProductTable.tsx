"use client";

import { useState, useMemo } from "react";
import {
  deleteProduct,
  toggleProductStatus,
  toggleProductFeatured,
} from "@/lib/actions/product.actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Trash,
  Edit,
  SortAsc,
  SortDesc,
  Star,
  Eye,
  EyeOff,
  Search,
  Plus,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import ProductForm from "./ProductForm";

const ProductTable = ({
  products,
  categories,
}: {
  products: any[];
  categories: any[];
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortKey, setSortKey] = useState<"title" | "price" | "stock" | "sold" | null>("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editProduct, setEditProduct] = useState<any | null>(null);

  // Filters and sorting
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(
      (p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (p) =>
          (p.category?._id || p.category) === selectedCategory
      );
    }

    if (sortKey) {
      filtered.sort((a, b) => {
        let valA = a[sortKey];
        let valB = b[sortKey];

        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();

        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [products, searchQuery, selectedCategory, sortKey, sortOrder]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const handleDeleteProduct = async (id: string) => {
    try {
      const response = await deleteProduct(id);
      if (response) {
        toast.success(response.message);
      }
    } catch (error) {
      toast.error("Failed to delete product");
      console.error(error);
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const response = await toggleProductStatus(id);
      if (response) {
        toast.success(`Product status updated!`);
      }
    } catch (error) {
      toast.error("Failed to toggle status");
      console.error(error);
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      const response = await toggleProductFeatured(id);
      if (response) {
        toast.success(`Product featured status updated!`);
      }
    } catch (error) {
      toast.error("Failed to toggle featured status");
      console.error(error);
    }
  };

  const handleSort = (key: "title" | "price" | "stock" | "sold") => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters and controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, SKU, brand..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 w-full"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="flex h-10 w-full sm:w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead className="w-16">Image</TableHead>
              <TableHead>
                <div
                  onClick={() => handleSort("title")}
                  className="flex items-center gap-2 cursor-pointer select-none font-semibold text-primary"
                >
                  Product Details
                  {sortKey === "title" &&
                    (sortOrder === "asc" ? <SortAsc size={14} /> : <SortDesc size={14} />)}
                </div>
              </TableHead>
              <TableHead>Category & Brand</TableHead>
              <TableHead>
                <div
                  onClick={() => handleSort("price")}
                  className="flex items-center gap-2 cursor-pointer select-none font-semibold text-primary"
                >
                  Price
                  {sortKey === "price" &&
                    (sortOrder === "asc" ? <SortAsc size={14} /> : <SortDesc size={14} />)}
                </div>
              </TableHead>
              <TableHead>
                <div
                  onClick={() => handleSort("stock")}
                  className="flex items-center gap-2 cursor-pointer select-none font-semibold text-primary"
                >
                  Stock
                  {sortKey === "stock" &&
                    (sortOrder === "asc" ? <SortAsc size={14} /> : <SortDesc size={14} />)}
                </div>
              </TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Featured</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedProducts.length > 0 ? (
              paginatedProducts.map((product, index) => {
                const isOutOfStock = product.stock <= 0;
                const isLowStock = product.stock > 0 && product.stock <= 5;
                const displayCategory = product.category?.name || "Uncategorized";

                return (
                  <TableRow key={product._id} className="hover:bg-gray-50 transition-all">
                    {/* Index */}
                    <TableCell className="text-muted-foreground text-sm font-medium">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </TableCell>

                    {/* Thumbnail */}
                    <TableCell>
                      <div className="relative w-12 h-12 rounded border bg-gray-50 overflow-hidden">
                        <Image
                          src={product.images?.[0] || "/assets/images/placeholder.png"}
                          alt={product.title}
                          fill
                          className="object-contain"
                          sizes="48px"
                        />
                      </div>
                    </TableCell>

                    {/* Product Details */}
                    <TableCell className="max-w-[240px]">
                      <div className="font-semibold text-primary truncate" title={product.title}>
                        {product.title}
                      </div>
                      <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                        SKU: {product.sku || "N/A"}
                      </div>
                    </TableCell>

                    {/* Category & Brand */}
                    <TableCell>
                      <div className="text-sm font-medium text-gray-700">{displayCategory}</div>
                      <div className="text-xs text-muted-foreground">{product.brand}</div>
                    </TableCell>

                    {/* Price */}
                    <TableCell>
                      <div className="font-semibold text-primary">৳{product.price}</div>
                      {product.oldPrice ? (
                        <div className="text-[11px] text-muted-foreground line-through">
                          ৳{product.oldPrice}
                        </div>
                      ) : null}
                    </TableCell>

                    {/* Stock Status */}
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-semibold ${
                            isOutOfStock
                              ? "text-red-600"
                              : isLowStock
                                ? "text-amber-600"
                                : "text-green-600"
                          }`}
                        >
                          {product.stock}
                        </span>
                        {isOutOfStock && (
                          <span className="inline-flex px-1.5 py-0.5 rounded bg-red-100 text-[10px] text-red-800 font-bold">
                            OUT
                          </span>
                        )}
                        {isLowStock && (
                          <AlertTriangle size={12} className="text-amber-500 animate-pulse" />
                        )}
                      </div>
                    </TableCell>

                    {/* Active/Inactive Status Badge Toggle */}
                    <TableCell className="text-center">
                      <button
                        onClick={() => handleToggleStatus(product._id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer border transition-all ${
                          product.isActive
                            ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                            : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                        }`}
                        title="Click to toggle status"
                      >
                        {product.isActive ? (
                          <>
                            <Eye size={12} /> Active
                          </>
                        ) : (
                          <>
                            <EyeOff size={12} /> Inactive
                          </>
                        )}
                      </button>
                    </TableCell>

                    {/* Featured Star Toggle */}
                    <TableCell className="text-center">
                      <button
                        onClick={() => handleToggleFeatured(product._id)}
                        className="cursor-pointer p-1 rounded-full hover:bg-yellow-50 transition-all text-center inline-block"
                        title="Click to toggle featured"
                      >
                        <Star
                          size={18}
                          className={
                            product.featured
                              ? "fill-yellow-400 text-yellow-500"
                              : "text-gray-300 hover:text-yellow-400"
                          }
                        />
                      </button>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setEditProduct(product)}
                          className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setConfirmDeleteId(product._id)}
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                  No products found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {filteredProducts.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-muted-foreground">
            Showing {Math.min(itemsPerPage * currentPage, filteredProducts.length)} of{" "}
            {filteredProducts.length} products
          </span>
          <div className="flex items-center space-x-2">
            <Button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
            <Button
              disabled={currentPage >= Math.ceil(filteredProducts.length / itemsPerPage)}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-xl border shadow-lg max-w-sm w-full space-y-4 m-4">
            <h3 className="text-lg font-semibold text-primary">Delete Product</h3>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2.5">
              <Button onClick={() => setConfirmDeleteId(null)} variant="outline">
                Cancel
              </Button>
              <Button
                onClick={() => handleDeleteProduct(confirmDeleteId)}
                variant="destructive"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      {editProduct && (
        <Dialog open={!!editProduct} onOpenChange={() => setEditProduct(null)}>
          <DialogContent className="max-w-4xl bg-white max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Edit Product</DialogTitle>
              <DialogDescription>
                Modify details of the product. Make sure all required fields are filled out.
              </DialogDescription>
            </DialogHeader>
            <div className="py-2">
              <ProductForm
                type="Update"
                initialData={editProduct}
                categories={categories}
                onSuccess={() => setEditProduct(null)}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ProductTable;
