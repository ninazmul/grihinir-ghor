import { getProducts } from "@/lib/actions/product.actions";
import { getCategories } from "@/lib/actions/category.actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ProductForm from "../components/ProductForm";
import ProductTable from "../components/ProductTable";
import { Button } from "@/components/ui/button";
import { requireDashboardRole } from "@/lib/auth/admin";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

const ProductsPage = async () => {
  // Require dashboard access (accessible by Admin and Moderator)
  const { role } = await requireDashboardRole(["Admin", "Moderator"]);

  // Fetch all products and categories in parallel
  const [productsResult, categories] = await Promise.all([
    getProducts({ limit: 1000 }), // Fetch high limit for list management
    getCategories(),
  ]);

  const products = productsResult?.data || [];

  return (
    <>
      <section className="py-4 md:py-6">
        <Dialog>
          <div className="wrapper flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-3xl font-bold text-primary">
                Product Inventory
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Manage, edit, publish, and track stocks of all store products.
              </p>
            </div>
            <DialogTrigger asChild>
              <Button size="lg" className="rounded-full flex items-center gap-2">
                <Plus className="w-5 h-5" /> Add Product
              </Button>
            </DialogTrigger>
          </div>

          <DialogContent className="max-w-4xl bg-white max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Create New Product</DialogTitle>
              <DialogDescription>
                Fill out the fields to publish a new product to the catalog. Ensure price and stock are set correctly.
              </DialogDescription>
            </DialogHeader>
            <div className="py-2">
              <ProductForm type="Create" categories={categories || []} />
            </div>
          </DialogContent>
        </Dialog>
      </section>

      <div className="wrapper my-6">
        <ProductTable products={products} categories={categories || []} />
      </div>
    </>
  );
};

export default ProductsPage;
