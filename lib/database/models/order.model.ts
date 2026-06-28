import { Document, Schema, Types, model, models } from "mongoose";

export interface IOrderItem {
  product: Types.ObjectId;
  title: string;
  price: number;
  quantity: number;
  variant?: {
    name: string;
    value: string;
  };
}

export interface ICustomerDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  city?: string;
  district?: string;
  postalCode?: string;
}

export interface IOrder extends Document {
  _id: Types.ObjectId;
  orderId: string;
  items: IOrderItem[];
  customer: ICustomerDetails;
  totalAmount: number;
  subTotal: number;
  deliveryCharge: number;
  
  // Payment
  paymentMethod: string;
  paymentStatus: string;
  
  // Order Status
  status: "Pending" | "Confirmed" | "Processing" | "Shipped" | "Delivered" | "Cancelled" | "Returned";
  
  // Shipping / Steadfast info
  trackingNumber?: string;
  consignmentId?: string;
  courier?: string;
  shippedAt?: Date;
  deliveredAt?: Date;
  
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    variant: {
      name: String,
      value: String,
    },
  },
  { _id: false }
);

const CustomerDetailsSchema = new Schema<ICustomerDetails>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: String,
    district: String,
    postalCode: String,
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
    },
    customer: {
      type: CustomerDetailsSchema,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    subTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryCharge: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    paymentMethod: {
      type: String,
      required: true,
      default: "COD",
    },
    paymentStatus: {
      type: String,
      required: true,
      default: "Pending",
    },
    status: {
      type: String,
      required: true,
      enum: ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled", "Returned"],
      default: "Pending",
    },
    
    // Steadfast / Shipping info
    trackingNumber: String,
    consignmentId: String,
    courier: String,
    shippedAt: Date,
    deliveredAt: Date,
    
    notes: String,
  },
  {
    timestamps: true,
  }
);

OrderSchema.index({ orderId: "text", "customer.name": "text", "customer.phone": "text" });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ status: 1 });

const Order = models.Order || model<IOrder>("Order", OrderSchema);

export default Order;
