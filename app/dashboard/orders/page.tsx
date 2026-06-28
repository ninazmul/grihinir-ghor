import { getOrders } from "@/lib/actions/order.actions";
import OrderTable from "../components/OrderTable";
import { requireDashboardRole } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

const OrdersPage = async () => {
  // Require dashboard access (accessible by Admin and Moderator)
  await requireDashboardRole(["Admin", "Moderator"]);

  // Fetch all orders from database
  const ordersResult = await getOrders({ limit: 1000 });
  const orders = ordersResult?.data || [];

  return (
    <>
      <section className="py-4 md:py-6">
        <div className="wrapper">
          <h3 className="text-3xl font-bold text-primary">
            Customer Orders
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Track customer payments, dispatch items, assign Steadfast courier details, and manage inventory statuses.
          </p>
        </div>
      </section>

      <div className="wrapper my-6">
        <OrderTable orders={orders} />
      </div>
    </>
  );
};

export default OrdersPage;
