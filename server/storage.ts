import {
  users,
  products,
  categories,
  cartItems,
  orders,
  orderItems,
  coupons,
  reviews,
  otpVerifications,
  type User,
  type UpsertUser,
  type Product,
  type InsertProduct,
  type Category,
  type InsertCategory,
  type CartItem,
  type InsertCartItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type Coupon,
  type InsertCoupon,
  type Review,
  type InsertReview,
  type OtpVerification,
  type InsertOtp,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, gte, lte, like, sql, SQL, inArray } from "drizzle-orm";
import { ApiError } from "./types";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Product operations
  getProducts(filters?: {
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    material?: string;
    search?: string;
  }): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  getFeaturedProducts(): Promise<Product[]>;
  
  // Cart operations
  getCartItems(userId: string): Promise<(CartItem & { product: Product })[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem>;
  removeFromCart(id: number): Promise<void>;
  clearCart(userId: string): Promise<void>;
  
  // Order operations
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  getOrders(userId?: string): Promise<(Order & { orderItems: (OrderItem & { product: Product | null })[] })[]>;
  getOrder(id: number): Promise<(Order & { orderItems: (OrderItem & { product: Product | null })[] }) | undefined>;
  updateOrderStatus(id: number, status: string): Promise<Order>;
  updateOrderTrackingNumber(id: number, trackingNumber: string): Promise<Order>;
  
  // Coupon operations
  getCoupon(code: string): Promise<Coupon | undefined>;
  validateCoupon(code: string, amount: number): Promise<{ valid: boolean; discount?: number; message?: string }>;
  
  // OTP operations
  createOtp(otp: InsertOtp): Promise<OtpVerification>;
  verifyOtp(phoneNumber: string, otp: string): Promise<boolean>;
  
  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getProductReviews(productId: number): Promise<(Review & { user: User })[]>;

  insertOrderItems(items: InsertOrderItem[]): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  // Product operations
  async getProducts(filters?: {
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    material?: string;
    search?: string;
  }): Promise<Product[]> {
    let query = db.select().from(products);
    
    const conditions: SQL[] = [eq(products.inStock, true)];
    
    if (filters) {
      if (filters.category) {
        conditions.push(eq(products.categoryId, Number(filters.category)));
      }
      if (filters.brand) {
        conditions.push(inArray(sql`lower(${products.brand})`, filters.brand.split(',').map(b => b.toLowerCase())));
      }
      if (filters.minPrice) {
        conditions.push(gte(products.price, filters.minPrice.toString()));
      }
      if (filters.maxPrice) {
        conditions.push(lte(products.price, filters.maxPrice.toString()));
      }
      if (filters.material) {
        conditions.push(inArray(sql`lower(${products.material})`, filters.material.split(',').map(m => m.toLowerCase())));
      }
      if (filters.search) {
        const searchConditions = [
          like(products.name, `%${filters.search}%`),
          like(products.description, `%${filters.search}%`),
          like(products.brand, `%${filters.search}%`),
          like(products.model, `%${filters.search}%`)
        ];
        if (searchConditions.length > 0) {
          const orCondition = or(...searchConditions);
          if (orCondition) {
            conditions.push(orCondition);
          }
        }
      }
    }
    
    try {
      return await query.where(and(...conditions.filter(Boolean))).orderBy(desc(products.createdAt));
    } catch (error) {
      throw new ApiError(500, "Failed to fetch products", undefined, error);
    }
  }

  async getProduct(id: number): Promise<Product | undefined> {
    try {
      const [product] = await db.select().from(products).where(eq(products.id, id));
      return product;
    } catch (error) {
      throw new ApiError(500, "Failed to fetch product", undefined, error);
    }
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product> {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(and(eq(products.featured, true), eq(products.inStock, true)))
      .orderBy(desc(products.rating))
      .limit(8);
  }

  // Cart operations
  async getCartItems(userId: string): Promise<(CartItem & { product: Product })[]> {
    return await db
      .select()
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, userId))
      .then(rows => 
        rows.map(row => ({
          ...row.cart_items,
          product: row.products!
        }))
      );
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(and(
        eq(cartItems.userId, cartItem.userId),
        eq(cartItems.productId, cartItem.productId)
      ));

    if (existingItem) {
      // Update quantity
      const [updatedItem] = await db
        .update(cartItems)
        .set({ quantity: existingItem.quantity + (cartItem.quantity ?? 1) })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    } else {
      // Insert new item
      const [newItem] = await db.insert(cartItems).values(cartItem).returning();
      return newItem;
    }
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem> {
    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updatedItem;
  }

  async removeFromCart(id: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  // Order operations
  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    
    // Insert order items
    await this.insertOrderItems(items);
    
    return newOrder;
  }

  async getOrders(userId?: string): Promise<(Order & { orderItems: (OrderItem & { product: Product | null })[] })[]> {
    try {
      let query = db.select().from(orders);
      
      const orderList = await (userId
        ? query.where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt))
        : query.orderBy(desc(orders.createdAt)));
      
      // Fetch order items with products for each order
      const ordersWithItems = await Promise.all(
        orderList.map(async (order) => {
          const items = await db
            .select({
              order_items: orderItems,
              products: products
            })
            .from(orderItems)
            .leftJoin(products, eq(orderItems.productId, products.id))
            .where(eq(orderItems.orderId, order.id))
            .then(rows =>
              rows.map(row => ({
                ...row.order_items,
                product: row.products ?? null
              }))
            );

          return {
            ...order,
            orderItems: items
          };
        })
      );

      return ordersWithItems;
    } catch (error) {
      console.error("Error in getOrders:", error);
      throw error;
    }
  }

  async getOrder(id: number): Promise<(Order & { orderItems: (OrderItem & { product: Product | null })[] }) | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return undefined;

    const items = await db
      .select()
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, id))
      .then(rows =>
        rows.map(row => ({
          ...row.order_items,
          product: row.products ?? null
        }))
      );

    return {
      ...order,
      orderItems: items
    };
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status: status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    if (!updatedOrder) {
      throw new ApiError(404, "Order not found");
    }
    return updatedOrder;
  }

  async updateOrderTrackingNumber(id: number, trackingNumber: string): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ trackingNumber, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    if (!updatedOrder) {
      throw new ApiError(404, 'Order not found');
    }
    return updatedOrder;
  }

  // Coupon operations
  async getCoupon(code: string): Promise<Coupon | undefined> {
    try {
      const [coupon] = await db.select().from(coupons).where(eq(coupons.code, code));
      return coupon;
    } catch (error) {
      throw new ApiError(500, "Failed to fetch coupon", undefined, error);
    }
  }

  async validateCoupon(code: string, amount: number): Promise<{ valid: boolean; discount?: number; message?: string }> {
    const coupon = await this.getCoupon(code);
    
    if (!coupon) {
      return { valid: false, message: "Invalid coupon code" };
    }
    
    if (!coupon.isActive) {
      return { valid: false, message: "Coupon is no longer active" };
    }
    
    if (coupon.validUntil && new Date() > coupon.validUntil) {
      return { valid: false, message: "Coupon has expired" };
    }
    
    if (coupon.minOrderAmount && amount < parseFloat(coupon.minOrderAmount)) {
      return { valid: false, message: `Minimum order amount is ₹${coupon.minOrderAmount}` };
    }
    
    if (coupon.usageLimit && (coupon.usedCount ?? 0) >= coupon.usageLimit) {
      return { valid: false, message: "Coupon usage limit reached" };
    }
    
    let discount = 0;
    if (coupon.discountType === "percentage") {
      discount = (amount * parseFloat(coupon.discountValue)) / 100;
      if (coupon.maxDiscountAmount) {
        discount = Math.min(discount, parseFloat(coupon.maxDiscountAmount));
      }
    } else {
      discount = parseFloat(coupon.discountValue);
    }
    
    return { valid: true, discount };
  }

  // OTP operations
  async createOtp(otp: InsertOtp): Promise<OtpVerification> {
    const [newOtp] = await db.insert(otpVerifications).values(otp).returning();
    return newOtp;
  }

  async verifyOtp(phoneNumber: string, otp: string): Promise<boolean> {
    const [verification] = await db
      .select()
      .from(otpVerifications)
      .where(
        and(
          eq(otpVerifications.phoneNumber, phoneNumber),
          eq(otpVerifications.otp, otp),
          eq(otpVerifications.verified, false),
          gte(otpVerifications.expiresAt, new Date())
        )
      );

    if (verification) {
      await db
        .update(otpVerifications)
        .set({ verified: true })
        .where(eq(otpVerifications.id, verification.id));
      return true;
    }
    return false;
  }

  // Review operations
  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  async getProductReviews(productId: number): Promise<(Review & { user: User })[]> {
    const productReviews = await db
      .select({
        id: reviews.id,
        productId: reviews.productId,
        userId: reviews.userId,
        rating: reviews.rating,
        title: reviews.title,
        comment: reviews.comment,
        verified: reviews.verified,
        helpful: reviews.helpful,
        createdAt: reviews.createdAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.productId, productId))
      .orderBy(desc(reviews.createdAt));

    return productReviews as (Review & { user: User })[];
  }

  async insertOrderItems(items: InsertOrderItem[]): Promise<void> {
    if (!items.length) return;
    await db.insert(orderItems).values(items);
  }
}

export const storage = new DatabaseStorage();
