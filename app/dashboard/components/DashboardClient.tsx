"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IAdmin } from "@/lib/database/models/admin.model";
import { ISettingSafe } from "@/lib/database/models/setting.model";
import {
  DashboardDateFilterResolved,
  DashboardDatePreset,
} from "@/lib/dashboard-date-filter";
import { EcommerceDashboardStats } from "@/lib/ecommerce-dashboard.stats";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface DashboardClientProps {
  setting: ISettingSafe | null;
  admins: IAdmin[];
  ecommerceStats: EcommerceDashboardStats;
  dateFilter: DashboardDateFilterResolved;
}

function parseDateSafe(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDate(value?: string | null): string {
  const date = parseDateSafe(value);
  if (!date) return "-";
  return date.toLocaleString();
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-BD", {
    maximumFractionDigits: 0,
  }).format(value);
}

const PRESET_OPTIONS: { value: DashboardDatePreset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last7days", label: "Last 7 Days" },
  { value: "last30days", label: "Last 30 Days" },
  { value: "thisMonth", label: "This Month" },
  { value: "all", label: "All Time" },
  { value: "custom", label: "Custom Range" },
];

const PIE_COLORS = [
  "#6366f1",
  "#06b6d4",
  "#8b5cf6",
  "#f59e0b",
  "#22c55e",
  "#ef4444",
  "#3b82f6",
];

function MetricCard({
  title,
  value,
  helper,
}: {
  title: string;
  value: string | number;
  helper?: string;
}) {
  return (
    <Card className="overflow-hidden border border-white/40 bg-white/70 shadow-lg backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-xl">
      <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500" />
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tracking-tight text-slate-900">
          {value}
        </p>
        {helper ? (
          <p className="mt-1 text-xs text-slate-500">{helper}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function formatTooltipValue(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value) || 0;
  return 0;
}

function ChartCard({
  title,
  children,
  subtitle,
}: {
  title: string;
  children: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <Card className="overflow-hidden border border-white/40 bg-white/70 shadow-lg backdrop-blur-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-base font-semibold text-slate-900">
          {title}
        </CardTitle>
        {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function MiniListCard({
  title,
  emptyText,
  children,
}: {
  title: string;
  emptyText: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden border border-white/40 bg-white/70 shadow-lg backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-slate-900">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
        {children ? (
          children
        ) : (
          <p className="text-sm text-slate-500">{emptyText}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardClient({
  setting,
  admins,
  ecommerceStats,
  dateFilter,
}: DashboardClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [preset, setPreset] = useState<DashboardDatePreset>(dateFilter.preset);
  const [startDate, setStartDate] = useState(dateFilter.startDateInput);
  const [endDate, setEndDate] = useState(dateFilter.endDateInput);

  useEffect(() => {
    setPreset(dateFilter.preset);
    setStartDate(dateFilter.startDateInput);
    setEndDate(dateFilter.endDateInput);
  }, [dateFilter.preset, dateFilter.startDateInput, dateFilter.endDateInput]);

  const updateFilterParams = (
    nextPreset: DashboardDatePreset,
    from?: string,
    to?: string,
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("preset", nextPreset);

    if (nextPreset === "custom") {
      if (from) params.set("startDate", from);
      if (to) params.set("endDate", to);
    } else {
      params.delete("startDate");
      params.delete("endDate");
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const handlePresetChange = (value: DashboardDatePreset) => {
    setPreset(value);

    if (value !== "custom") {
      updateFilterParams(value);
    }
  };

  const handleApplyFilter = () => {
    if (preset === "custom") {
      updateFilterParams("custom", startDate, endDate);
      return;
    }

    updateFilterParams(preset);
  };

  const canApplyCustom =
    preset !== "custom" ||
    (startDate.trim().length > 0 && endDate.trim().length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="overflow-hidden rounded-3xl border border-white/50 bg-white/70 p-5 shadow-xl backdrop-blur-xl md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                {setting?.branding?.storeName || "E-commerce Dashboard"}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Live overview of sales, orders, courier delivery tracking, products, and inventory stock.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="min-w-[180px]">
                <p className="mb-1 text-xs font-medium text-slate-500">
                  Date Filter
                </p>
                <Select value={preset} onValueChange={handlePresetChange}>
                  <SelectTrigger className="bg-white/90">
                    <SelectValue placeholder="Select a range" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRESET_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {preset === "custom" ? (
                <>
                  <div>
                    <p className="mb-1 text-xs font-medium text-slate-500">
                      Start Date
                    </p>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-white/90"
                    />
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-medium text-slate-500">
                      End Date
                    </p>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-white/90"
                    />
                  </div>
                  <Button
                    onClick={handleApplyFilter}
                    disabled={!canApplyCustom}
                  >
                    Apply
                  </Button>
                </>
              ) : null}
            </div>
          </div>

          {!dateFilter.isValid && dateFilter.error ? (
            <p className="mt-3 text-sm font-medium text-red-600">
              {dateFilter.error}
            </p>
          ) : null}
        </div>

        {/* E-commerce Metric Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Total Revenue"
            value={`$ ${formatCurrency(ecommerceStats.totals.totalRevenue)}`}
            helper="Excludes cancelled/returned orders"
          />
          <MetricCard
            title="Total Orders"
            value={ecommerceStats.totals.totalOrders}
            helper="Within selected date range"
          />
          <MetricCard
            title="Pending Orders"
            value={ecommerceStats.totals.pendingOrders}
          />
          <MetricCard
            title="Delivered Orders"
            value={ecommerceStats.totals.deliveredOrders}
          />
          <MetricCard
            title="Total Products"
            value={ecommerceStats.totals.totalProducts}
          />
          <MetricCard
            title="Low Stock Alert"
            value={ecommerceStats.totals.lowStockCount}
            helper="Stock levels 1 to 5 items"
          />
          <MetricCard
            title="Out of Stock"
            value={ecommerceStats.totals.outOfStockCount}
            helper="No stock remaining"
          />
          <MetricCard
            title="Admins"
            value={admins.length}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2 space-y-4">
            <ChartCard
              title="Revenue Trend"
              subtitle="Monthly revenue in the selected range (excludes cancelled/returned orders)."
            >
              <div className="h-[320px]">
                {ecommerceStats.revenueTrend.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">
                    No revenue trend data in this range.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ecommerceStats.revenueTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => {
                          const v = formatTooltipValue(value);
                          return [`$ ${formatCurrency(v)}`, "Revenue"];
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name="Revenue"
                        stroke="#6366f1"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </ChartCard>

            <ChartCard
              title="Order Volume Trend"
              subtitle="Monthly orders placed in the selected range."
            >
              <div className="h-[320px]">
                {ecommerceStats.orderTrend.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">
                    No order trend data in this range.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ecommerceStats.orderTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="value"
                        name="Orders"
                        fill="#0f172a"
                        radius={[10, 10, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </ChartCard>
          </div>

          <div className="space-y-4">
            <ChartCard title="Order Status Distribution">
              <div className="h-[240px]">
                {ecommerceStats.orderStatusDistribution.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">
                    No order status data.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ecommerceStats.orderStatusDistribution}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={3}
                      >
                        {ecommerceStats.orderStatusDistribution.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </ChartCard>

            <ChartCard title="Payment Status Distribution">
              <div className="h-[240px]">
                {ecommerceStats.paymentStatusDistribution.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">
                    No payment status data.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ecommerceStats.paymentStatusDistribution}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={3}
                      >
                        {ecommerceStats.paymentStatusDistribution.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={PIE_COLORS[(index + 3) % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </ChartCard>
          </div>
        </div>

        {/* Bottom Section: Recent Orders & Top Selling Products */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <MiniListCard
            title="Recent Orders"
            emptyText="No orders found."
          >
            {ecommerceStats.recentOrders.length === 0
              ? null
              : ecommerceStats.recentOrders.map((order) => (
                  <div
                    key={order._id}
                    className="flex justify-between items-center rounded-2xl border border-slate-100 bg-white/60 p-4 shadow-sm hover:shadow-md transition"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        Order #{order.orderId}
                      </p>
                      <p className="text-sm text-slate-500">
                        {order.customerName} ({order.customerPhone})
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <p className="font-semibold text-indigo-600">
                        ${formatCurrency(order.totalAmount)}
                      </p>
                      <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase ${
                        order.status === "Delivered"
                          ? "bg-green-100 text-green-800"
                          : order.status === "Cancelled" || order.status === "Returned"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
          </MiniListCard>

          <MiniListCard
            title="Top Selling Products"
            emptyText="No product sales data found."
          >
            {ecommerceStats.topProducts.length === 0
              ? null
              : ecommerceStats.topProducts.map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white/60 p-4 shadow-sm hover:shadow-md transition"
                  >
                    {product.image ? (
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden border bg-white flex-shrink-0">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-400 font-semibold flex-shrink-0">
                        No Img
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">
                        {product.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        Price: ${formatCurrency(product.price)} | Stock: {product.stock}
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <p className="font-semibold text-slate-900">
                        {product.sold} sold
                      </p>
                      <p className="text-xs text-indigo-600 font-medium">
                        Total: ${formatCurrency(product.revenue)}
                      </p>
                    </div>
                  </div>
                ))}
          </MiniListCard>
        </div>
      </div>
    </div>
  );
}
