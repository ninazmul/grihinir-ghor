import { connectToDatabase } from "@/lib/database";
import Order, { IOrder } from "@/lib/database/models/order.model";
import Product from "@/lib/database/models/product.model";
import { DashboardDateFilterResolved } from "./dashboard-date-filter";

export interface EcommerceDashboardStats {
  totals: {
    totalRevenue: number;
    totalOrders: number;
    pendingOrders: number;
    deliveredOrders: number;
    totalProducts: number;
    activeProducts: number;
    lowStockCount: number;
    outOfStockCount: number;
  };
  orderStatusDistribution: { name: string; value: number }[];
  paymentStatusDistribution: { name: string; value: number }[];
  revenueTrend: { label: string; value: number }[];
  orderTrend: { label: string; value: number }[];
  recentOrders: {
    _id: string;
    orderId: string;
    customerName: string;
    customerPhone: string;
    totalAmount: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
  }[];
  topProducts: {
    _id: string;
    title: string;
    slug: string;
    price: number;
    sold: number;
    stock: number;
    revenue: number;
    image?: string;
  }[];
}

function formatMonthLabel(year: number, month: number): string {
  return new Date(year, month - 1, 1).toLocaleString("default", {
    month: "short",
    year: "numeric",
  });
}

export async function getEcommerceDashboardStats(
  dateFilter: DashboardDateFilterResolved,
): Promise<EcommerceDashboardStats> {
  await connectToDatabase();

  // 1. Build date query for orders
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const matchQuery: Record<string, any> = {};
  if (dateFilter.startDate || dateFilter.endDate) {
    matchQuery.createdAt = {};
    if (dateFilter.startDate) {
      matchQuery.createdAt.$gte = dateFilter.startDate;
    }
    if (dateFilter.endDate) {
      matchQuery.createdAt.$lte = dateFilter.endDate;
    }
  }

  // 2. Fetch product and inventory metrics
  const [
    totalProducts,
    activeProducts,
    outOfStockCount,
    lowStockCount,
    topProductsRaw,
  ] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ isActive: true }),
    Product.countDocuments({ stock: { $lte: 0 } }),
    Product.countDocuments({ stock: { $gt: 0, $lte: 5 } }),
    Product.find()
      .sort({ sold: -1 })
      .limit(6)
      .select("title slug price sold stock images")
      .lean(),
  ]);

  // Map top products
  const topProducts = topProductsRaw.map((p) => ({
    _id: String(p._id),
    title: p.title ?? "Unnamed Product",
    slug: p.slug ?? "",
    price: p.price ?? 0,
    sold: p.sold ?? 0,
    stock: p.stock ?? 0,
    revenue: (p.price ?? 0) * (p.sold ?? 0),
    image: Array.isArray(p.images) ? p.images[0] : undefined,
  }));

  // 3. Aggregate Orders
  const orderAgg = await Order.aggregate([
    { $match: matchQuery },
    {
      $facet: {
        // Compute overall totals
        totals: [
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              pendingOrders: {
                $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] },
              },
              deliveredOrders: {
                $sum: { $cond: [{ $eq: ["$status", "Delivered"] }, 1, 0] },
              },
              totalRevenue: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $ne: ["$status", "Cancelled"] },
                        { $ne: ["$status", "Returned"] },
                      ],
                    },
                    "$totalAmount",
                    0,
                  ],
                },
              },
            },
          },
        ],
        // Group by status
        statusBreakdown: [
          { $group: { _id: "$status", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ],
        // Group by payment status
        paymentBreakdown: [
          { $group: { _id: "$paymentStatus", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ],
        // Group by month for trend
        trends: [
          {
            $project: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              totalAmount: 1,
              status: 1,
            },
          },
          {
            $group: {
              _id: { year: "$year", month: "$month" },
              orderCount: { $sum: 1 },
              revenue: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $ne: ["$status", "Cancelled"] },
                        { $ne: ["$status", "Returned"] },
                      ],
                    },
                    "$totalAmount",
                    0,
                  ],
                },
              },
            },
          },
          {
            $sort: { "_id.year": 1, "_id.month": 1 },
          },
        ],
        // Recent orders
        recent: [
          { $sort: { createdAt: -1 } },
          { $limit: 10 },
          {
            $project: {
              orderId: 1,
              customerName: "$customer.name",
              customerPhone: "$customer.phone",
              totalAmount: 1,
              status: 1,
              paymentStatus: 1,
              createdAt: 1,
            },
          },
        ],
      },
    },
  ]);

  const results = orderAgg[0] || {};
  const totalsRaw = results.totals?.[0] || {};

  const orderStatusDistribution = (results.statusBreakdown || []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (item: any) => ({
      name: item._id ?? "Unknown",
      value: item.count ?? 0,
    }),
  );

  const paymentStatusDistribution = (results.paymentBreakdown || []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (item: any) => ({
      name: item._id ?? "Unknown",
      value: item.count ?? 0,
    }),
  );

  const recentOrders = (results.recent || []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (item: any) => ({
      _id: String(item._id),
      orderId: item.orderId ?? "",
      customerName: item.customerName ?? "Guest",
      customerPhone: item.customerPhone ?? "",
      totalAmount: item.totalAmount ?? 0,
      status: item.status ?? "Pending",
      paymentStatus: item.paymentStatus ?? "Pending",
      createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : "",
    }),
  );

  const revenueTrend = (results.trends || []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (item: any) => ({
      label: formatMonthLabel(item._id.year, item._id.month),
      value: item.revenue ?? 0,
    }),
  );

  const orderTrend = (results.trends || []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (item: any) => ({
      label: formatMonthLabel(item._id.year, item._id.month),
      value: item.orderCount ?? 0,
    }),
  );

  return {
    totals: {
      totalRevenue: totalsRaw.totalRevenue ?? 0,
      totalOrders: totalsRaw.totalOrders ?? 0,
      pendingOrders: totalsRaw.pendingOrders ?? 0,
      deliveredOrders: totalsRaw.deliveredOrders ?? 0,
      totalProducts,
      activeProducts,
      lowStockCount,
      outOfStockCount,
    },
    orderStatusDistribution,
    paymentStatusDistribution,
    revenueTrend,
    orderTrend,
    recentOrders,
    topProducts,
  };
}
