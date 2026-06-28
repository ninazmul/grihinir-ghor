// lib/product-dashboard.stats.ts
import Product from "@/lib/database/models/product.model";
import { connectToDatabase } from "@/lib/database";
import { Types } from "mongoose";

// ====================
// Types
// ====================

export type ProductMonthlyCount = {
  month: string;
  count: number;
  revenue?: number;
};

export type CategorySales = {
  categoryId: string;
  categoryName: string;
  productCount: number;
  totalStock: number;
  totalSold: number;
  totalRevenue: number;
};

export type BrandSales = {
  brand: string;
  productCount: number;
  totalSold: number;
  totalRevenue: number;
};

export type TopProduct = {
  _id: string;
  title: string;
  slug: string;
  price: number;
  sold: number;
  stock: number;
  rating: number;
  revenue: number;
  image?: string;
};

export type StockAlert = {
  _id: string;
  title: string;
  slug: string;
  sku: string;
  stock: number;
  sold: number;
  image?: string;
};

export type ProductDashboardStats = {
  totals: {
    totalProducts: number;
    activeProducts: number;
    inactiveProducts: number;
    featuredProducts: number;
    totalStock: number;
    totalSold: number;
    totalRevenue: number;
    averagePrice: number;
    averageRating: number;
    outOfStockCount: number;
    lowStockCount: number;
  };
  inventory: {
    outOfStock: StockAlert[];
    lowStock: StockAlert[];
  };
  byCategory: CategorySales[];
  byBrand: BrandSales[];
  topProducts: {
    bySold: TopProduct[];
    byRevenue: TopProduct[];
    byRating: TopProduct[];
    newest: TopProduct[];
  };
  monthly: {
    productsAdded: ProductMonthlyCount[];
  };
  priceDistribution: {
    range: string;
    count: number;
  }[];
};

// ====================
// Helpers
// ====================

function monthKey(d: Date): string {
  return d.toLocaleString("default", { month: "short", year: "numeric" });
}

const LOW_STOCK_THRESHOLD = 5;

// ====================
// Main Dashboard Function
// ====================

export async function getProductDashboardStats(): Promise<ProductDashboardStats> {
  await connectToDatabase();

  // Single aggregation pipeline using $facet for efficiency
  const aggResult = await Product.aggregate([
    {
      $facet: {
        // --- Overall Totals ---
        totals: [
          {
            $group: {
              _id: null,
              totalProducts: { $sum: 1 },
              activeProducts: {
                $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
              },
              inactiveProducts: {
                $sum: { $cond: [{ $eq: ["$isActive", false] }, 1, 0] },
              },
              featuredProducts: {
                $sum: { $cond: [{ $eq: ["$featured", true] }, 1, 0] },
              },
              totalStock: { $sum: { $ifNull: ["$stock", 0] } },
              totalSold: { $sum: { $ifNull: ["$sold", 0] } },
              totalRevenue: {
                $sum: {
                  $multiply: [
                    { $ifNull: ["$price", 0] },
                    { $ifNull: ["$sold", 0] },
                  ],
                },
              },
              averagePrice: { $avg: { $ifNull: ["$price", 0] } },
              averageRating: { $avg: { $ifNull: ["$rating", 0] } },
              outOfStockCount: {
                $sum: { $cond: [{ $lte: ["$stock", 0] }, 1, 0] },
              },
              lowStockCount: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $gt: ["$stock", 0] },
                        { $lte: ["$stock", LOW_STOCK_THRESHOLD] },
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
            },
          },
        ],

        // --- Out of Stock Products ---
        outOfStock: [
          { $match: { stock: { $lte: 0 } } },
          { $sort: { sold: -1 } },
          { $limit: 10 },
          {
            $project: {
              title: 1,
              slug: 1,
              sku: 1,
              stock: 1,
              sold: 1,
              image: { $arrayElemAt: ["$images", 0] },
            },
          },
        ],

        // --- Low Stock Products ---
        lowStock: [
          {
            $match: {
              stock: { $gt: 0, $lte: LOW_STOCK_THRESHOLD },
            },
          },
          { $sort: { stock: 1 } },
          { $limit: 10 },
          {
            $project: {
              title: 1,
              slug: 1,
              sku: 1,
              stock: 1,
              sold: 1,
              image: { $arrayElemAt: ["$images", 0] },
            },
          },
        ],

        // --- Sales by Category ---
        byCategory: [
          {
            $group: {
              _id: "$category",
              productCount: { $sum: 1 },
              totalStock: { $sum: { $ifNull: ["$stock", 0] } },
              totalSold: { $sum: { $ifNull: ["$sold", 0] } },
              totalRevenue: {
                $sum: {
                  $multiply: [
                    { $ifNull: ["$price", 0] },
                    { $ifNull: ["$sold", 0] },
                  ],
                },
              },
            },
          },
          {
            $lookup: {
              from: "categories",
              localField: "_id",
              foreignField: "_id",
              as: "categoryInfo",
            },
          },
          { $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true } },
          { $sort: { totalRevenue: -1 } },
        ],

        // --- Sales by Brand ---
        byBrand: [
          {
            $group: {
              _id: "$brand",
              productCount: { $sum: 1 },
              totalSold: { $sum: { $ifNull: ["$sold", 0] } },
              totalRevenue: {
                $sum: {
                  $multiply: [
                    { $ifNull: ["$price", 0] },
                    { $ifNull: ["$sold", 0] },
                  ],
                },
              },
            },
          },
          { $sort: { totalRevenue: -1 } },
          { $limit: 10 },
        ],

        // --- Top by Sold ---
        topBySold: [
          { $match: { sold: { $gt: 0 } } },
          { $sort: { sold: -1 } },
          { $limit: 10 },
          {
            $project: {
              title: 1,
              slug: 1,
              price: 1,
              sold: 1,
              stock: 1,
              rating: 1,
              revenue: {
                $multiply: [
                  { $ifNull: ["$price", 0] },
                  { $ifNull: ["$sold", 0] },
                ],
              },
              image: { $arrayElemAt: ["$images", 0] },
            },
          },
        ],

        // --- Top by Revenue ---
        topByRevenue: [
          { $match: { sold: { $gt: 0 } } },
          {
            $addFields: {
              revenue: {
                $multiply: [
                  { $ifNull: ["$price", 0] },
                  { $ifNull: ["$sold", 0] },
                ],
              },
            },
          },
          { $sort: { revenue: -1 } },
          { $limit: 10 },
          {
            $project: {
              title: 1,
              slug: 1,
              price: 1,
              sold: 1,
              stock: 1,
              rating: 1,
              revenue: 1,
              image: { $arrayElemAt: ["$images", 0] },
            },
          },
        ],

        // --- Top by Rating ---
        topByRating: [
          { $match: { numReviews: { $gt: 0 } } },
          { $sort: { rating: -1, numReviews: -1 } },
          { $limit: 10 },
          {
            $project: {
              title: 1,
              slug: 1,
              price: 1,
              sold: 1,
              stock: 1,
              rating: 1,
              revenue: {
                $multiply: [
                  { $ifNull: ["$price", 0] },
                  { $ifNull: ["$sold", 0] },
                ],
              },
              image: { $arrayElemAt: ["$images", 0] },
            },
          },
        ],

        // --- Newest Products ---
        newest: [
          { $sort: { createdAt: -1 } },
          { $limit: 10 },
          {
            $project: {
              title: 1,
              slug: 1,
              price: 1,
              sold: 1,
              stock: 1,
              rating: 1,
              revenue: {
                $multiply: [
                  { $ifNull: ["$price", 0] },
                  { $ifNull: ["$sold", 0] },
                ],
              },
              image: { $arrayElemAt: ["$images", 0] },
            },
          },
        ],

        // --- Monthly Products Added ---
        monthly: [
          { $match: { createdAt: { $exists: true } } },
          {
            $project: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
          },
          {
            $group: {
              _id: { year: "$year", month: "$month" },
              count: { $sum: 1 },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } },
        ],

        // --- Price Distribution ---
        priceDistribution: [
          {
            $bucket: {
              groupBy: "$price",
              boundaries: [0, 100, 500, 1000, 5000, 10000, 50000],
              default: "50000+",
              output: {
                count: { $sum: 1 },
              },
            },
          },
        ],
      },
    },
  ]);

  const agg = (aggResult && aggResult[0]) || {};

  // --- Totals ---
  const totalsRaw = (agg.totals && agg.totals[0]) || {};

  const totals: ProductDashboardStats["totals"] = {
    totalProducts: totalsRaw.totalProducts ?? 0,
    activeProducts: totalsRaw.activeProducts ?? 0,
    inactiveProducts: totalsRaw.inactiveProducts ?? 0,
    featuredProducts: totalsRaw.featuredProducts ?? 0,
    totalStock: totalsRaw.totalStock ?? 0,
    totalSold: totalsRaw.totalSold ?? 0,
    totalRevenue: totalsRaw.totalRevenue ?? 0,
    averagePrice: Math.round((totalsRaw.averagePrice ?? 0) * 100) / 100,
    averageRating: Math.round((totalsRaw.averageRating ?? 0) * 100) / 100,
    outOfStockCount: totalsRaw.outOfStockCount ?? 0,
    lowStockCount: totalsRaw.lowStockCount ?? 0,
  };

  // --- Inventory Alerts ---
  const outOfStock: StockAlert[] = (agg.outOfStock || []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (p: any) => ({
      _id: String(p._id),
      title: p.title ?? "",
      slug: p.slug ?? "",
      sku: p.sku ?? "",
      stock: p.stock ?? 0,
      sold: p.sold ?? 0,
      image: p.image ?? undefined,
    }),
  );

  const lowStock: StockAlert[] = (agg.lowStock || []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (p: any) => ({
      _id: String(p._id),
      title: p.title ?? "",
      slug: p.slug ?? "",
      sku: p.sku ?? "",
      stock: p.stock ?? 0,
      sold: p.sold ?? 0,
      image: p.image ?? undefined,
    }),
  );

  // --- Category Sales ---
  const byCategory: CategorySales[] = (agg.byCategory || []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (c: any) => ({
      categoryId: c._id ? String(c._id) : "",
      categoryName: c.categoryInfo?.name ?? "Uncategorized",
      productCount: c.productCount ?? 0,
      totalStock: c.totalStock ?? 0,
      totalSold: c.totalSold ?? 0,
      totalRevenue: c.totalRevenue ?? 0,
    }),
  );

  // --- Brand Sales ---
  const byBrand: BrandSales[] = (agg.byBrand || []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (b: any) => ({
      brand: b._id ?? "Unknown",
      productCount: b.productCount ?? 0,
      totalSold: b.totalSold ?? 0,
      totalRevenue: b.totalRevenue ?? 0,
    }),
  );

  // --- Top Products helper ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function mapTopProduct(p: any): TopProduct {
    return {
      _id: String(p._id),
      title: p.title ?? "",
      slug: p.slug ?? "",
      price: p.price ?? 0,
      sold: p.sold ?? 0,
      stock: p.stock ?? 0,
      rating: p.rating ?? 0,
      revenue: p.revenue ?? 0,
      image: p.image ?? undefined,
    };
  }

  const topBySold: TopProduct[] = (agg.topBySold || []).map(mapTopProduct);
  const topByRevenue: TopProduct[] = (agg.topByRevenue || []).map(mapTopProduct);
  const topByRating: TopProduct[] = (agg.topByRating || []).map(mapTopProduct);
  const newest: TopProduct[] = (agg.newest || []).map(mapTopProduct);

  // --- Monthly Products Added ---
  const monthlyRaw = (agg.monthly || []) as Array<{
    _id: { year: number; month: number };
    count?: number;
  }>;

  const productsAdded: ProductMonthlyCount[] = monthlyRaw.map((m) => {
    const d = new Date(m._id.year, m._id.month - 1, 1);
    return {
      month: monthKey(d),
      count: m.count ?? 0,
    };
  });

  // --- Price Distribution ---
  const priceRangeLabels: Record<string, string> = {
    "0": "৳0 – ৳99",
    "100": "৳100 – ৳499",
    "500": "৳500 – ৳999",
    "1000": "৳1K – ৳4.9K",
    "5000": "৳5K – ৳9.9K",
    "10000": "৳10K – ৳49.9K",
    "50000+": "৳50K+",
  };

  const priceDistribution = (
    agg.priceDistribution || []
  ).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (bucket: any) => ({
      range: priceRangeLabels[String(bucket._id)] ?? `৳${bucket._id}+`,
      count: bucket.count ?? 0,
    }),
  );

  // --- Build Final Stats ---
  const stats: ProductDashboardStats = {
    totals,
    inventory: {
      outOfStock,
      lowStock,
    },
    byCategory,
    byBrand,
    topProducts: {
      bySold: topBySold,
      byRevenue: topByRevenue,
      byRating: topByRating,
      newest,
    },
    monthly: {
      productsAdded,
    },
    priceDistribution,
  };

  return stats;
}

// ====================
// Filtered Dashboard (with date range)
// ====================

export type ProductDateFilter = {
  startDate?: Date | null;
  endDate?: Date | null;
};

export async function getProductDashboardStatsFiltered(
  dateFilter?: ProductDateFilter,
): Promise<ProductDashboardStats> {
  // If no date filter, use the main function
  if (!dateFilter?.startDate && !dateFilter?.endDate) {
    return getProductDashboardStats();
  }

  await connectToDatabase();

  // Build date match stage
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dateMatch: Record<string, any> = {};
  if (dateFilter.startDate) {
    dateMatch.$gte = dateFilter.startDate;
  }
  if (dateFilter.endDate) {
    dateMatch.$lte = dateFilter.endDate;
  }

  const matchStage =
    Object.keys(dateMatch).length > 0
      ? { $match: { createdAt: dateMatch } }
      : { $match: {} };

  // Run a simpler aggregation with the date filter
  const aggResult = await Product.aggregate([
    matchStage,
    {
      $facet: {
        totals: [
          {
            $group: {
              _id: null,
              totalProducts: { $sum: 1 },
              activeProducts: {
                $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
              },
              inactiveProducts: {
                $sum: { $cond: [{ $eq: ["$isActive", false] }, 1, 0] },
              },
              featuredProducts: {
                $sum: { $cond: [{ $eq: ["$featured", true] }, 1, 0] },
              },
              totalStock: { $sum: { $ifNull: ["$stock", 0] } },
              totalSold: { $sum: { $ifNull: ["$sold", 0] } },
              totalRevenue: {
                $sum: {
                  $multiply: [
                    { $ifNull: ["$price", 0] },
                    { $ifNull: ["$sold", 0] },
                  ],
                },
              },
              averagePrice: { $avg: { $ifNull: ["$price", 0] } },
              averageRating: { $avg: { $ifNull: ["$rating", 0] } },
              outOfStockCount: {
                $sum: { $cond: [{ $lte: ["$stock", 0] }, 1, 0] },
              },
              lowStockCount: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $gt: ["$stock", 0] },
                        { $lte: ["$stock", LOW_STOCK_THRESHOLD] },
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
            },
          },
        ],
        topBySold: [
          { $match: { sold: { $gt: 0 } } },
          { $sort: { sold: -1 } },
          { $limit: 10 },
          {
            $project: {
              title: 1,
              slug: 1,
              price: 1,
              sold: 1,
              stock: 1,
              rating: 1,
              revenue: {
                $multiply: [
                  { $ifNull: ["$price", 0] },
                  { $ifNull: ["$sold", 0] },
                ],
              },
              image: { $arrayElemAt: ["$images", 0] },
            },
          },
        ],
      },
    },
  ]);

  const agg = (aggResult && aggResult[0]) || {};
  const totalsRaw = (agg.totals && agg.totals[0]) || {};

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function mapTopProduct(p: any): TopProduct {
    return {
      _id: String(p._id),
      title: p.title ?? "",
      slug: p.slug ?? "",
      price: p.price ?? 0,
      sold: p.sold ?? 0,
      stock: p.stock ?? 0,
      rating: p.rating ?? 0,
      revenue: p.revenue ?? 0,
      image: p.image ?? undefined,
    };
  }

  return {
    totals: {
      totalProducts: totalsRaw.totalProducts ?? 0,
      activeProducts: totalsRaw.activeProducts ?? 0,
      inactiveProducts: totalsRaw.inactiveProducts ?? 0,
      featuredProducts: totalsRaw.featuredProducts ?? 0,
      totalStock: totalsRaw.totalStock ?? 0,
      totalSold: totalsRaw.totalSold ?? 0,
      totalRevenue: totalsRaw.totalRevenue ?? 0,
      averagePrice: Math.round((totalsRaw.averagePrice ?? 0) * 100) / 100,
      averageRating: Math.round((totalsRaw.averageRating ?? 0) * 100) / 100,
      outOfStockCount: totalsRaw.outOfStockCount ?? 0,
      lowStockCount: totalsRaw.lowStockCount ?? 0,
    },
    inventory: { outOfStock: [], lowStock: [] },
    byCategory: [],
    byBrand: [],
    topProducts: {
      bySold: (agg.topBySold || []).map(mapTopProduct),
      byRevenue: [],
      byRating: [],
      newest: [],
    },
    monthly: { productsAdded: [] },
    priceDistribution: [],
  };
}
