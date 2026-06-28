"use client";

import { useState, useMemo } from "react";
import {
  updateOrderStatus,
  updateOrderShippingInfo,
  updateOrderPaymentStatus,
} from "@/lib/actions/order.actions";
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
  Search,
  Eye,
  Truck,
  Calendar,
  CheckCircle,
  XCircle,
  RefreshCw,
  Clock,
  Package,
  User,
  MapPin,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const OrderTable = ({ orders }: { orders: any[] }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Modal states
  const [viewOrder, setViewOrder] = useState<any | null>(null);
  const [shippingOrder, setShippingOrder] = useState<any | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);

  // Shipping form fields
  const [trackingNumber, setTrackingNumber] = useState("");
  const [consignmentId, setConsignmentId] = useState("");
  const [courier, setCourier] = useState("Steadfast");

  // Filtering
  const filteredOrders = useMemo(() => {
    let filtered = orders.filter(
      (o) =>
        o.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customer.phone.includes(searchQuery)
    );

    if (selectedStatus !== "all") {
      filtered = filtered.filter((o) => o.status === selectedStatus);
    }

    if (selectedPaymentStatus !== "all") {
      filtered = filtered.filter((o) => o.paymentStatus === selectedPaymentStatus);
    }

    return filtered;
  }, [orders, searchQuery, selectedStatus, selectedPaymentStatus]);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  // Handle status update
  const handleStatusChange = async (id: string, status: any) => {
    setIsUpdatingStatus(id);
    try {
      const response = await updateOrderStatus(id, status);
      if (response) {
        toast.success(`Status updated to ${status}`);
        // If viewing, update current view data
        if (viewOrder && viewOrder._id === id) {
          setViewOrder(response);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
      console.error(error);
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  // Handle payment status update
  const handlePaymentStatusChange = async (id: string, paymentStatus: any) => {
    try {
      const response = await updateOrderPaymentStatus(id, paymentStatus);
      if (response) {
        toast.success(`Payment updated to ${paymentStatus}`);
        if (viewOrder && viewOrder._id === id) {
          setViewOrder(response);
        }
      }
    } catch (error) {
      toast.error("Failed to update payment status");
      console.error(error);
    }
  };

  // Open shipping dialog
  const openShippingDialog = (order: any) => {
    setShippingOrder(order);
    setTrackingNumber(order.trackingNumber || "");
    setConsignmentId(order.consignmentId || "");
    setCourier(order.courier || "Steadfast");
  };

  // Handle shipping save
  const handleSaveShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingOrder) return;

    try {
      const response = await updateOrderShippingInfo(shippingOrder._id, {
        trackingNumber,
        consignmentId,
        courier,
      });

      if (response) {
        toast.success("Shipping info updated!");
        setShippingOrder(null);
        // Refresh local details view if currently active
        if (viewOrder && viewOrder._id === shippingOrder._id) {
          setViewOrder(response);
        }
      }
    } catch (error) {
      toast.error("Failed to update shipping info");
      console.error(error);
    }
  };

  // Color mappings
  const statusColors: Record<string, string> = {
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    Confirmed: "bg-blue-50 text-blue-700 border-blue-200",
    Processing: "bg-indigo-50 text-indigo-700 border-indigo-200",
    Shipped: "bg-purple-50 text-purple-700 border-purple-200",
    Delivered: "bg-green-50 text-green-700 border-green-200",
    Cancelled: "bg-red-50 text-red-700 border-red-200",
    Returned: "bg-gray-50 text-gray-700 border-gray-200",
  };

  const paymentColors: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-800",
    Paid: "bg-green-100 text-green-800",
    Failed: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ID, name, or phone..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 w-full"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="flex h-10 w-full sm:w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Returned">Returned</option>
          </select>

          <select
            value={selectedPaymentStatus}
            onChange={(e) => {
              setSelectedPaymentStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="flex h-10 w-full sm:w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Payment Status</option>
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Total (৳)</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Order Status</TableHead>
              <TableHead>Tracking</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedOrders.length > 0 ? (
              paginatedOrders.map((order, index) => {
                const totalQty = order.items.reduce((sum: number, i: any) => sum + i.quantity, 0);

                return (
                  <TableRow key={order._id} className="hover:bg-gray-50 transition-all">
                    {/* Index */}
                    <TableCell className="text-muted-foreground text-sm font-medium">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </TableCell>

                    {/* Order ID */}
                    <TableCell className="font-semibold text-primary font-mono text-xs">
                      {order.orderId}
                    </TableCell>

                    {/* Customer */}
                    <TableCell>
                      <div className="font-medium text-primary text-sm">{order.customer.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{order.customer.phone}</div>
                    </TableCell>

                    {/* Products summary */}
                    <TableCell className="max-w-[200px] truncate">
                      <div className="text-sm font-medium text-gray-700">
                        {order.items[0]?.title}
                        {order.items.length > 1 ? ` +${order.items.length - 1} more` : ""}
                      </div>
                      <div className="text-xs text-muted-foreground">Qty: {totalQty}</div>
                    </TableCell>

                    {/* Total price */}
                    <TableCell className="font-semibold text-primary">
                      ৳{order.totalAmount}
                    </TableCell>

                    {/* Payment status badge */}
                    <TableCell>
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${paymentColors[order.paymentStatus] || "bg-gray-100 text-gray-800"}`}>
                        {order.paymentStatus}
                      </span>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{order.paymentMethod}</div>
                    </TableCell>

                    {/* Order status selector */}
                    <TableCell>
                      {isUpdatingStatus === order._id ? (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Updating...
                        </div>
                      ) : (
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value as any)}
                          className={`h-7 rounded border px-2 py-0.5 text-xs font-semibold focus:outline-none transition-all cursor-pointer ${statusColors[order.status]}`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                          <option value="Returned">Returned</option>
                        </select>
                      )}
                    </TableCell>

                    {/* Tracking details */}
                    <TableCell>
                      {order.trackingNumber ? (
                        <div className="text-xs">
                          <span className="font-medium text-gray-700 font-mono block">{order.trackingNumber}</span>
                          <span className="text-[10px] text-muted-foreground">{order.courier}</span>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openShippingDialog(order)}
                          className="h-7 text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                        >
                          <Truck className="w-3.5 h-3.5" /> Ship
                        </Button>
                      )}
                    </TableCell>

                    {/* View Details Actions */}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setViewOrder(order)}
                          className="h-8 w-8 text-primary hover:bg-gray-100"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                  No orders found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {filteredOrders.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-muted-foreground">
            Showing {Math.min(itemsPerPage * currentPage, filteredOrders.length)} of{" "}
            {filteredOrders.length} orders
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
              disabled={currentPage >= Math.ceil(filteredOrders.length / itemsPerPage)}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* VIEW ORDER DETAILS MODAL */}
      {viewOrder && (
        <Dialog open={!!viewOrder} onOpenChange={() => setViewOrder(null)}>
          <DialogContent className="max-w-3xl bg-white max-h-[90vh] overflow-y-auto">
            <DialogHeader className="border-b pb-4">
              <DialogTitle className="text-lg font-bold flex items-center justify-between">
                <span>Order Details: <span className="font-mono text-indigo-600 font-bold">{viewOrder.orderId}</span></span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[viewOrder.status]}`}>
                  {viewOrder.status}
                </span>
              </DialogTitle>
              <DialogDescription>
                Placed on {new Date(viewOrder.createdAt).toLocaleDateString()} at {new Date(viewOrder.createdAt).toLocaleTimeString()}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              {/* Left Column: Customer details */}
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h4 className="font-semibold text-sm text-primary flex items-center gap-1.5 mb-3 border-b pb-1.5">
                    <User className="w-4 h-4 text-indigo-600" /> Customer Information
                  </h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><span className="text-muted-foreground font-medium">Name:</span> {viewOrder.customer.name}</p>
                    <p><span className="text-muted-foreground font-medium">Phone:</span> {viewOrder.customer.phone}</p>
                    <p><span className="text-muted-foreground font-medium">Email:</span> {viewOrder.customer.email}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h4 className="font-semibold text-sm text-primary flex items-center gap-1.5 mb-3 border-b pb-1.5">
                    <MapPin className="w-4 h-4 text-indigo-600" /> Delivery Address
                  </h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p className="leading-relaxed">{viewOrder.customer.address}</p>
                    <p>
                      {viewOrder.customer.city && <span className="mr-2">City: {viewOrder.customer.city}</span>}
                      {viewOrder.customer.district && <span>District: {viewOrder.customer.district}</span>}
                    </p>
                  </div>
                </div>

                {viewOrder.notes && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h4 className="font-semibold text-sm text-primary flex items-center gap-1.5 mb-2 border-b pb-1.5">
                      <FileText className="w-4 h-4 text-indigo-600" /> Notes
                    </h4>
                    <p className="text-sm text-gray-700 italic">"{viewOrder.notes}"</p>
                  </div>
                )}
              </div>

              {/* Right Column: Status operations, Payment and Shipping */}
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h4 className="font-semibold text-sm text-primary flex items-center gap-1.5 mb-3 border-b pb-1.5">
                    <Clock className="w-4 h-4 text-indigo-600" /> Order Operations
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-muted-foreground font-medium block mb-1">Update Status</span>
                      <select
                        value={viewOrder.status}
                        onChange={(e) => handleStatusChange(viewOrder._id, e.target.value as any)}
                        className={`h-9 w-full rounded border px-2 py-0.5 text-xs font-semibold focus:outline-none cursor-pointer ${statusColors[viewOrder.status]}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Returned">Returned</option>
                      </select>
                    </div>

                    <div>
                      <span className="text-muted-foreground font-medium block mb-1">Payment Status</span>
                      <select
                        value={viewOrder.paymentStatus}
                        onChange={(e) => handlePaymentStatusChange(viewOrder._id, e.target.value as any)}
                        className="h-9 w-full rounded border border-gray-300 bg-white px-2 py-0.5 text-xs font-semibold focus:outline-none cursor-pointer"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                        <option value="Failed">Failed</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h4 className="font-semibold text-sm text-primary flex items-center justify-between gap-1.5 mb-3 border-b pb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-indigo-600" /> Courier & Shipping
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 text-[10px] px-2 py-0"
                      onClick={() => openShippingDialog(viewOrder)}
                    >
                      Edit Info
                    </Button>
                  </h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><span className="text-muted-foreground font-medium">Courier Service:</span> {viewOrder.courier || "Not shipped yet"}</p>
                    <p><span className="text-muted-foreground font-medium">Tracking Number:</span> {viewOrder.trackingNumber || "N/A"}</p>
                    <p><span className="text-muted-foreground font-medium">Consignment ID:</span> {viewOrder.consignmentId || "N/A"}</p>
                    {viewOrder.shippedAt && (
                      <p><span className="text-muted-foreground font-medium">Shipped At:</span> {new Date(viewOrder.shippedAt).toLocaleDateString()}</p>
                    )}
                    {viewOrder.deliveredAt && (
                      <p><span className="text-muted-foreground font-medium">Delivered At:</span> {new Date(viewOrder.deliveredAt).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section: Products List */}
            <div className="border-t pt-4 space-y-3">
              <h4 className="font-semibold text-sm text-primary flex items-center gap-1.5 mb-1">
                <Package className="w-4 h-4 text-indigo-600" /> Products Purchased
              </h4>
              <div className="border rounded-lg overflow-hidden bg-gray-50">
                <Table className="text-xs">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viewOrder.items.map((item: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <div className="font-medium">{item.title}</div>
                          {item.variant && (
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                              {item.variant.name}: {item.variant.value}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>৳{item.price}</TableCell>
                        <TableCell>x {item.quantity}</TableCell>
                        <TableCell className="text-right font-semibold">৳{item.price * item.quantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Financial calculations summary */}
              <div className="flex flex-col items-end space-y-1.5 text-sm pt-2 pr-2 border-t border-dashed">
                <div className="flex justify-between w-full max-w-[240px] text-xs">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-semibold">৳{viewOrder.subTotal}</span>
                </div>
                <div className="flex justify-between w-full max-w-[240px] text-xs">
                  <span className="text-muted-foreground">Delivery Charge:</span>
                  <span className="font-semibold">+ ৳{viewOrder.deliveryCharge}</span>
                </div>
                <div className="flex justify-between w-full max-w-[240px] text-base font-bold text-primary border-t pt-1.5">
                  <span>Total amount:</span>
                  <span>৳{viewOrder.totalAmount}</span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* EDIT SHIPPING INFO MODAL */}
      {shippingOrder && (
        <Dialog open={!!shippingOrder} onOpenChange={() => setShippingOrder(null)}>
          <DialogContent className="max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">Courier & Shipping Setup</DialogTitle>
              <DialogDescription>
                Assign Steadfast details or tracking information for Order ID: <span className="font-mono font-bold text-indigo-600">{shippingOrder.orderId}</span>.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveShipping} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Courier Partner</label>
                <select
                  value={courier}
                  onChange={(e) => setCourier(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="Steadfast">Steadfast Courier</option>
                  <option value="Pathao">Pathao Courier</option>
                  <option value="RedX">RedX Courier</option>
                  <option value="Paperfly">Paperfly</option>
                  <option value="SA Paribahan">SA Paribahan</option>
                  <option value="Sundarban Courier">Sundarban Courier</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Tracking Code / Number</label>
                <Input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="E.g. SF123456789"
                  className="w-full"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Consignment ID (Optional)</label>
                <Input
                  value={consignmentId}
                  onChange={(e) => setConsignmentId(e.target.value)}
                  placeholder="E.g. consignment-987654"
                  className="w-full"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t">
                <Button type="button" variant="outline" onClick={() => setShippingOrder(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="px-5 font-semibold">
                  Update Delivery Info
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default OrderTable;
