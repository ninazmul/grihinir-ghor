"use server";

import { Types } from "mongoose";
import { revalidatePath } from "next/cache";

import {
  CreateOrderParams,
  OrderFilterParams,
  PaginatedResult,
} from "@/types";

import { handleError, generateOrderId } from "../utils";
import { connectToDatabase } from "../database";
import Order, { IOrder } from "../database/models/order.model";
import Product from "../database/models/product.model";

// ====================
// Create Order
// ====================

export const createOrder = async (params: CreateOrderParams) => {
  try {
    await connectToDatabase();

    const { items, customer, deliveryCharge, paymentMethod = "COD", notes } = params;

    // Calculate subtotal and total
    let subTotal = 0;
    const orderItems = [];

    for (const item of items) {
      const productObj = await Product.findById(item.product).select("price stock title");
      if (!productObj) {
        throw new Error(`Product not found: ${item.product}`);
      }

      // Check stock sufficiency
      if (productObj.stock < item.quantity) {
        throw new Error(`Insufficient stock for product "${productObj.title}". Available: ${productObj.stock}`);
      }

      const itemPrice = item.price || productObj.price;
      subTotal += itemPrice * item.quantity;

      orderItems.push({
        product: new Types.ObjectId(item.product),
        title: item.title || productObj.title,
        price: itemPrice,
        quantity: item.quantity,
        variant: item.variant,
      });
    }

    const totalAmount = subTotal + deliveryCharge;
    const orderId = generateOrderId();

    const newOrder = await Order.create({
      orderId,
      items: orderItems,
      customer,
      subTotal,
      deliveryCharge,
      totalAmount,
      paymentMethod,
      paymentStatus: "Pending",
      status: "Pending",
      notes,
    });

    // Update Product stocks and sold count
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: {
          stock: -item.quantity,
          sold: item.quantity,
        },
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/products");

    return JSON.parse(JSON.stringify(newOrder));
  } catch (error) {
    handleError(error);
  }
};

// ====================
// Get Order by ID
// ====================

export const getOrderById = async (orderId: string) => {
  try {
    await connectToDatabase();

    const order = await Order.findById(orderId)
      .populate("items.product", "title images sku")
      .lean();

    if (!order) {
      throw new Error("Order not found");
    }

    return JSON.parse(JSON.stringify(order));
  } catch (error) {
    handleError(error);
  }
};

// ====================
// Get Order by Order ID (String)
// ====================

export const getOrderByOrderId = async (orderIdString: string) => {
  try {
    await connectToDatabase();

    const order = await Order.findOne({ orderId: orderIdString })
      .populate("items.product", "title images sku")
      .lean();

    if (!order) {
      throw new Error("Order not found");
    }

    return JSON.parse(JSON.stringify(order));
  } catch (error) {
    handleError(error);
  }
};

// ====================
// Get All Orders (Paginated & Filtered)
// ====================

export const getOrders = async (
  filters: OrderFilterParams = {},
): Promise<PaginatedResult<IOrder> | undefined> => {
  try {
    await connectToDatabase();

    const {
      query,
      status,
      paymentStatus,
      paymentMethod,
      startDate,
      endDate,
      page = 1,
      limit = 12,
    } = filters;

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    // Search query (orderId, customer name, customer phone)
    if (query?.trim()) {
      filter.$or = [
        { orderId: { $regex: new RegExp(query.trim(), "i") } },
        { "customer.name": { $regex: new RegExp(query.trim(), "i") } },
        { "customer.phone": { $regex: new RegExp(query.trim(), "i") } },
      ];
    }

    // Status filter
    if (status?.trim()) {
      filter.status = status.trim();
    }

    // Payment status filter
    if (paymentStatus?.trim()) {
      filter.paymentStatus = paymentStatus.trim();
    }

    // Payment method filter
    if (paymentMethod?.trim()) {
      filter.paymentMethod = paymentMethod.trim();
    }

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Pagination
    const skip = (page - 1) * limit;

    const [orders, totalCount] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: JSON.parse(JSON.stringify(orders)),
      totalCount,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  } catch (error) {
    handleError(error);
  }
};

// ====================
// Update Order Status (With Stock Adjustment)
// ====================

export const updateOrderStatus = async (
  orderId: string,
  newStatus: "Pending" | "Confirmed" | "Processing" | "Shipped" | "Delivered" | "Cancelled" | "Returned",
) => {
  try {
    await connectToDatabase();

    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    const oldStatus = order.status;

    if (oldStatus === newStatus) {
      return JSON.parse(JSON.stringify(order));
    }

    // Determine stock updates:
    // If the old status was active and new status is inactive (Cancelled / Returned), restore stock
    const isOldActive = !["Cancelled", "Returned"].includes(oldStatus);
    const isNewActive = !["Cancelled", "Returned"].includes(newStatus);

    if (isOldActive && !isNewActive) {
      // Restore stock: increase stock, decrease sold
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: {
            stock: item.quantity,
            sold: -item.quantity,
          },
        });
      }
    } else if (!isOldActive && isNewActive) {
      // Deduct stock again: decrease stock, increase sold
      for (const item of order.items) {
        // Double-check stock before re-deducting
        const productObj = await Product.findById(item.product).select("stock title");
        if (productObj && productObj.stock < item.quantity) {
          throw new Error(`Insufficient stock for product "${productObj.title}" to re-activate order. Available: ${productObj.stock}`);
        }

        await Product.findByIdAndUpdate(item.product, {
          $inc: {
            stock: -item.quantity,
            sold: item.quantity,
          },
        });
      }
    }

    // Update status
    order.status = newStatus;

    // Auto-update payment status if delivered
    if (newStatus === "Delivered") {
      order.paymentStatus = "Paid";
      if (!order.deliveredAt) {
        order.deliveredAt = new Date();
      }
    }

    if (newStatus === "Shipped" && !order.shippedAt) {
      order.shippedAt = new Date();
    }

    await order.save();

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/products");

    return JSON.parse(JSON.stringify(order));
  } catch (error) {
    handleError(error);
  }
};

// ====================
// Update Order Shipping / Steadfast Info
// ====================

export const updateOrderShippingInfo = async (
  orderId: string,
  shippingInfo: {
    trackingNumber?: string;
    consignmentId?: string;
    courier?: string;
    shippedAt?: Date;
    deliveredAt?: Date;
  }
) => {
  try {
    await connectToDatabase();

    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    if (shippingInfo.trackingNumber !== undefined) order.trackingNumber = shippingInfo.trackingNumber;
    if (shippingInfo.consignmentId !== undefined) order.consignmentId = shippingInfo.consignmentId;
    if (shippingInfo.courier !== undefined) order.courier = shippingInfo.courier;
    if (shippingInfo.shippedAt !== undefined) order.shippedAt = shippingInfo.shippedAt;
    if (shippingInfo.deliveredAt !== undefined) order.deliveredAt = shippingInfo.deliveredAt;

    await order.save();

    revalidatePath("/dashboard");

    return JSON.parse(JSON.stringify(order));
  } catch (error) {
    handleError(error);
  }
};

// ====================
// Update Order Payment Status
// ====================

export const updateOrderPaymentStatus = async (
  orderId: string,
  paymentStatus: "Pending" | "Paid" | "Failed",
) => {
  try {
    await connectToDatabase();

    const order = await Order.findByIdAndUpdate(
      orderId,
      { $set: { paymentStatus } },
      { new: true }
    );

    if (!order) {
      throw new Error("Order not found");
    }

    revalidatePath("/dashboard");

    return JSON.parse(JSON.stringify(order));
  } catch (error) {
    handleError(error);
  }
};
