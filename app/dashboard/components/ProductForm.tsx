"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct } from "@/lib/actions/product.actions";
import Select from "react-select";
import { useState } from "react";
import { Plus, Trash, Image as ImageIcon, X, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { useUploadThing } from "@/lib/uploadthing";
import Image from "next/image";
import { RichTextEditor } from "@/components/shared/RichTextEditor";

export const productFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  slug: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters."),
  brand: z.string().min(2, "Brand must be at least 2 characters."),
  category: z.string().min(1, "Please select a category."),
  images: z.array(z.string()).default([]),
  price: z.coerce.number().min(0, "Price must be at least 0."),
  oldPrice: z.coerce.number().min(0, "Old price must be at least 0.").optional().or(z.literal(0)),
  sku: z.string().optional(),
  stock: z.coerce.number().min(0, "Stock must be at least 0."),
  tags: z.string().optional(), // Enter as comma-separated string, we convert to array on submit
  variants: z.array(
    z.object({
      name: z.string().min(1, "Name required (e.g. Color)"),
      value: z.string().min(1, "Value required (e.g. Red)"),
    })
  ).default([]),
  weight: z.coerce.number().optional().or(z.literal(0)),
  dimensions: z.object({
    length: z.coerce.number().optional().or(z.literal(0)),
    width: z.coerce.number().optional().or(z.literal(0)),
    height: z.coerce.number().optional().or(z.literal(0)),
  }).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  featured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

type ProductFormProps = {
  type: "Create" | "Update";
  initialData?: any;
  categories: Array<{ _id: string; name: string }>;
  onSuccess?: () => void;
};

const ProductForm = ({ type, initialData, categories, onSuccess }: ProductFormProps) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"basic" | "pricing" | "media" | "variants" | "seo">("basic");
  const { startUpload } = useUploadThing("mediaUploader");
  const [isUploading, setIsUploading] = useState(false);

  // Map initial values
  const defaultValues: z.infer<typeof productFormSchema> = {
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    brand: initialData?.brand || "",
    category: initialData?.category?._id || initialData?.category || "",
    images: initialData?.images || [],
    price: initialData?.price || 0,
    oldPrice: initialData?.oldPrice || 0,
    sku: initialData?.sku || "",
    stock: initialData?.stock || 0,
    tags: initialData?.tags?.join(", ") || "",
    variants: initialData?.variants || [],
    weight: initialData?.weight || 0,
    dimensions: {
      length: initialData?.dimensions?.length || 0,
      width: initialData?.dimensions?.width || 0,
      height: initialData?.dimensions?.height || 0,
    },
    seoTitle: initialData?.seoTitle || "",
    seoDescription: initialData?.seoDescription || "",
    featured: initialData?.featured || false,
    isActive: initialData?.isActive !== undefined ? initialData?.isActive : true,
  };

  const form = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema) as any,
    defaultValues,
  });

  const formControl = form.control as any;

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control: formControl,
    name: "variants",
  });

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const uploaded = await startUpload(files);
      if (uploaded && uploaded.length > 0) {
        const uploadedUrls = uploaded.map((file) => file.url);
        const currentImages = form.getValues("images") || [];
        form.setValue("images", [...currentImages, ...uploadedUrls]);
        toast.success("Images uploaded successfully!");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload images.");
    } finally {
      setIsUploading(false);
    }
  };

  // Remove an image from the list
  const removeImage = (urlToRemove: string) => {
    const currentImages = form.getValues("images") || [];
    form.setValue(
      "images",
      currentImages.filter((url) => url !== urlToRemove)
    );
  };

  async function onSubmit(values: z.infer<typeof productFormSchema>) {
    try {
      // Process tags string to array
      const tagsArray = values.tags
        ? values.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0)
        : [];

      const formattedData = {
        ...values,
        tags: tagsArray,
        // Remove empty values or convert to undefined for optional fields
        oldPrice: values.oldPrice || undefined,
        weight: values.weight || undefined,
        dimensions:
          values.dimensions?.length || values.dimensions?.width || values.dimensions?.height
            ? values.dimensions
            : undefined,
      };

      if (type === "Create") {
        const newProduct = await createProduct(formattedData);
        if (newProduct) {
          toast.success("Product created successfully!");
          form.reset();
          if (onSuccess) onSuccess();
          router.refresh();
        }
      } else {
        const updated = await updateProduct(initialData._id, formattedData);
        if (updated) {
          toast.success("Product updated successfully!");
          if (onSuccess) onSuccess();
          router.refresh();
        }
      }
    } catch (error: any) {
      console.error("Failed to save product:", error);
      toast.error(error.message || "An error occurred while saving product");
    }
  }

  const categoryOptions = categories.map((cat) => ({
    label: cat.name,
    value: cat._id,
  }));

  const tabClass = (tabName: string) =>
    `px-4 py-2 text-sm font-semibold rounded-md transition-all cursor-pointer select-none ${
      activeTab === tabName
        ? "bg-primary text-white"
        : "text-muted-foreground hover:bg-gray-100 hover:text-primary"
    }`;

  return (
    <div className="space-y-6">
      {/* Navigation tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-3">
        <div onClick={() => setActiveTab("basic")} className={tabClass("basic")}>Basic Info</div>
        <div onClick={() => setActiveTab("pricing")} className={tabClass("pricing")}>Pricing & Stock</div>
        <div onClick={() => setActiveTab("media")} className={tabClass("media")}>Media (Images)</div>
        <div onClick={() => setActiveTab("variants")} className={tabClass("variants")}>Variants & Details</div>
        <div onClick={() => setActiveTab("seo")} className={tabClass("seo")}>SEO & Settings</div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-5">
          {/* ================= BASIC TAB ================= */}
          {activeTab === "basic" && (
            <div className="space-y-4">
              <FormField
                control={formControl}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g. Premium Leather Purse" {...field} className="input-field" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={formControl}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Auto-generated from title if empty" {...field} className="input-field" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={formControl}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand *</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g. Grihini" {...field} className="input-field" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={formControl}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <FormControl>
                      <Select
                        options={categoryOptions}
                        isSearchable
                        placeholder="Search or select category..."
                        value={categoryOptions.find((opt) => opt.value === field.value) || null}
                        onChange={(selected) => field.onChange(selected?.value || "")}
                        classNamePrefix="react-select"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formControl}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <RichTextEditor value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* ================= PRICING & STOCK TAB ================= */}
          {activeTab === "pricing" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={formControl}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Selling Price (৳) *</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} className="input-field" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={formControl}
                  name="oldPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Original Price (৳) (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} className="input-field" />
                      </FormControl>
                      <FormDescription>Used to display a strike-through discount</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={formControl}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU (Stock Keeping Unit)</FormLabel>
                      <FormControl>
                        <Input placeholder="Auto-generated if empty" {...field} className="input-field" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={formControl}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Quantity *</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} className="input-field" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {/* ================= MEDIA TAB ================= */}
          {activeTab === "media" && (
            <div className="space-y-4">
              <FormLabel>Product Images</FormLabel>
              <div className="border border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 border-gray-300">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload-input"
                  disabled={isUploading}
                />
                <label
                  htmlFor="image-upload-input"
                  className="cursor-pointer flex flex-col items-center gap-2 text-center text-muted-foreground hover:text-primary transition-all"
                >
                  <Upload className="w-10 h-10 text-gray-400" />
                  <span className="font-semibold text-sm">
                    {isUploading ? "Uploading..." : "Click or drag images here to upload"}
                  </span>
                  <span className="text-xs text-gray-400">PNG, JPG, JPEG, WebP (max 5MB each)</span>
                </label>
              </div>

              {/* Image Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                {form.watch("images")?.map((url, index) => (
                  <div key={url} className="relative group aspect-square rounded-md overflow-hidden border border-gray-200 bg-gray-50">
                    <Image
                      src={url}
                      alt={`Product image ${index + 1}`}
                      fill
                      className="object-contain"
                    />
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 rounded-full">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeImage(url)}
                        className="w-8 h-8 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                      Image {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= VARIANTS & DETAILS TAB ================= */}
          {activeTab === "variants" && (
            <div className="space-y-6">
              {/* Product variants */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-sm">Product Variants</h4>
                    <p className="text-xs text-muted-foreground">Add specific options like Color: Black, Size: XL</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1.5"
                    onClick={() => appendVariant({ name: "", value: "" })}
                  >
                    <Plus className="w-4 h-4" /> Add Variant
                  </Button>
                </div>

                <div className="space-y-3">
                  {variantFields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-3">
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <FormField
                          control={formControl}
                          name={`variants.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="Variant Name (e.g. Size, Color)" {...field} className="input-field" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={formControl}
                          name={`variants.${index}.value`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="Variant Value (e.g. XL, Black)" {...field} className="input-field" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeVariant(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <h4 className="font-semibold text-sm">Shipping & Dimensions</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <FormField
                    control={formControl}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (kg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0" {...field} className="input-field" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={formControl}
                    name="dimensions.length"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Length (cm)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} className="input-field" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={formControl}
                    name="dimensions.width"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Width (cm)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} className="input-field" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={formControl}
                    name="dimensions.height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height (cm)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} className="input-field" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <FormField
                  control={formControl}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input placeholder="purse, bag, leather, handmade" {...field} className="input-field" />
                      </FormControl>
                      <FormDescription>Comma-separated list of keywords for search tagging</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {/* ================= SEO & STATUS TAB ================= */}
          {activeTab === "seo" && (
            <div className="space-y-4">
              <FormField
                control={formControl}
                name="seoTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SEO Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Custom title for Google search" {...field} className="input-field" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={formControl}
                name="seoDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SEO Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Custom meta description for search preview" {...field} className="input-field" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={formControl}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                        <FormDescription>
                          Whether the product is visible and buyable on the storefront.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={formControl}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Featured Product</FormLabel>
                        <FormDescription>
                          Showcase this product in featured grids/banners on home page.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="submit"
              size="lg"
              disabled={form.formState.isSubmitting}
              className="px-8 font-semibold w-full md:w-auto"
            >
              {form.formState.isSubmitting ? "Saving..." : `${type} Product`}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ProductForm;
