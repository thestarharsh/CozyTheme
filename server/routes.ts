import type { Express, Request, Response, RequestHandler, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./clerkAuth";
import Razorpay from "razorpay";
import crypto from "crypto";
import { insertProductSchema, insertCategorySchema, insertCartItemSchema, insertOrderSchema, insertOrderItemSchema } from "@shared/schema";
import { z } from "zod";
import * as XLSX from "xlsx";
import multer from "multer";
import { AuthenticatedRequest, AdminRequest, ApiError } from "./types";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { hasAdminAccess, requireAdminAccess } from "./access";

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const adminAccessEmails = [
  'testdevbyharsh@gmail.com',
  "cozygripzdev@gmail.com",
];

// Admin middleware
const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.auth.userId;
    if (!userId) {
      throw new ApiError(401, "User not authenticated");
    }

    await requireAdminAccess(userId);
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.status).json({ message: error.message });
    } else {
      console.error("Error checking admin access:", error);
      res.status(500).json({ message: "Failed to check admin access" });
    }
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, (async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.auth.userId;
      if (!userId) {
        throw new ApiError(401, "User not authenticated");
      }

      const user = await clerkClient.users.getUser(userId);
      const isAdmin = await hasAdminAccess(userId);
      
      res.json({
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        role: isAdmin ? 'admin' : 'user',
        profileImageUrl: user.imageUrl,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.status).json({ message: error.message });
      } else {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: "Failed to fetch user" });
      }
    }
  }) as RequestHandler);

  // Category routes
  app.get('/api/categories', (async (req: Request, res: Response) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.status).json({ message: error.message });
      } else {
        console.error("Error fetching categories:", error);
        res.status(500).json({ message: "Failed to fetch categories" });
      }
    }
  }) as RequestHandler);

  app.post('/api/categories', isAuthenticated, isAdmin, (async (req: Request, res: Response) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid category data", errors: error.errors });
      } else if (error instanceof ApiError) {
        res.status(error.status).json({ message: error.message });
      } else {
        console.error("Error creating category:", error);
        res.status(500).json({ message: "Failed to create category" });
      }
    }
  }) as RequestHandler);

  // Product routes
  app.get('/api/products', async (req, res) => {
    try {
      const filters = {
        category: req.query.category as string,
        brand: req.query.brand as string,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        material: req.query.material as string,
        search: req.query.search as string,
      };

      const products = await storage.getProducts(filters);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get('/api/products/featured', async (req, res) => {
    try {
      const products = await storage.getFeaturedProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching featured products:", error);
      res.status(500).json({ message: "Failed to fetch featured products" });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post('/api/products', isAuthenticated, upload.single('image'), (async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.auth.userId;
      if (!userId) {
        throw new ApiError(401, "User not authenticated");
      }

      await requireAdminAccess(userId);

      if (!req.file) {
        throw new ApiError(400, "Product image is required");
      }

      // Convert the image buffer to base64
      const imageBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

      const productData = insertProductSchema.parse({
        ...req.body,
        imageUrl: imageBase64
      });
      
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid product data", errors: error.errors });
      } else if (error instanceof ApiError) {
        res.status(error.status).json({ message: error.message });
      } else {
        console.error("Error creating product:", error);
        res.status(500).json({ message: "Failed to create product" });
      }
    }
  }) as RequestHandler);

  app.put('/api/products/:id', isAuthenticated, upload.single('image'), (async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.auth.userId;
      if (!userId) {
        throw new ApiError(401, "User not authenticated");
      }

      await requireAdminAccess(userId);

      const productId = parseInt(req.params.id);
      const productData = { ...req.body };

      // If a new image is uploaded, convert it to base64
      if (req.file) {
        const imageBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        productData.imageUrl = imageBase64;
      }

      const validatedData = insertProductSchema.parse(productData);
      const updatedProduct = await storage.updateProduct(productId, validatedData);
      res.json(updatedProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid product data", errors: error.errors });
      } else if (error instanceof ApiError) {
        res.status(error.status).json({ message: error.message });
      } else {
        console.error("Error updating product:", error);
        res.status(500).json({ message: "Failed to update product" });
      }
    }
  }) as RequestHandler);

  app.delete('/api/products/:id', isAuthenticated, (async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.auth.userId;
      if (!userId) {
        throw new ApiError(401, "User not authenticated");
      }

      await requireAdminAccess(userId);

      const productId = parseInt(req.params.id);
      await storage.deleteProduct(productId);
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.status).json({ message: error.message });
      } else {
        console.error("Error deleting product:", error);
        res.status(500).json({ message: "Failed to delete product" });
      }
    }
  }) as RequestHandler);

  // Cart routes
  app.get('/api/cart', isAuthenticated, (async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.auth.userId;
      if (!userId) {
        throw new ApiError(401, "User not authenticated");
      }

      const cartItems = await storage.getCartItems(userId);
      res.json(cartItems);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.status).json({ message: error.message });
      } else {
        console.error("Error fetching cart:", error);
        res.status(500).json({ message: "Failed to fetch cart" });
      }
    }
  }) as RequestHandler);

  app.post('/api/cart', isAuthenticated, (async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.auth.userId;
      if (!userId) {
        throw new ApiError(401, "User not authenticated");
      }

      const cartItemData = insertCartItemSchema.parse({
        ...req.body,
        userId
      });
      const cartItem = await storage.addToCart(cartItemData);
      res.json(cartItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid cart item data", errors: error.errors });
      } else if (error instanceof ApiError) {
        res.status(error.status).json({ message: error.message });
      } else {
        console.error("Error adding to cart:", error);
        res.status(500).json({ message: "Failed to add to cart" });
      }
    }
  }) as RequestHandler);

  app.put('/api/cart/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const { quantity } = req.body;
      const cartItem = await storage.updateCartItem(id, quantity);
      res.json(cartItem);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete('/api/cart/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.removeFromCart(id);
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ message: "Failed to remove from cart" });
    }
  });

  app.delete('/api/cart', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.auth.userId;
      if (!userId) {
        throw new ApiError(401, "User not authenticated");
      }
      await storage.clearCart(userId);
      res.json({ message: "Cart cleared" });
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Order routes
  app.post('/api/orders', isAuthenticated, (async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.auth.userId;
      if (!userId) {
        throw new ApiError(401, "User not authenticated");
      }

      const { items, ...orderData } = req.body;
      if (!items || !Array.isArray(items) || items.length === 0) {
        throw new ApiError(400, "Order must contain at least one item");
      }

      // Validate order items without orderId
      const validatedItems = items.map(item => {
        const { orderId, ...itemData } = item;
        return insertOrderItemSchema.omit({ orderId: true }).parse(itemData);
      });

      // Convert totalAmount to string if it's a number
      const orderDataWithStringAmount = {
        ...orderData,
        totalAmount: orderData.totalAmount.toString(),
        // Use shipping address as billing address if not provided
        billingAddress: orderData.billingAddress || orderData.shippingAddress
      };

      // Validate order data
      const validatedOrderData = insertOrderSchema.parse({
        ...orderDataWithStringAmount,
        userId,
        status: 'pending',
        orderNumber: `ORD-${Date.now()}`,
        paymentStatus: 'pending'
      });

      const order = await storage.createOrder(validatedOrderData, validatedItems);

      // Clear cart after successful order
      await storage.clearCart(userId);

      res.json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid order data", errors: error.errors });
      } else if (error instanceof ApiError) {
        res.status(error.status).json({ message: error.message });
      } else {
        console.error("Error creating order:", error);
        res.status(500).json({ message: "Failed to create order" });
      }
    }
  }) as RequestHandler);

  app.get('/api/orders', isAuthenticated, (async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.auth.userId;
      if (!userId) {
        throw new ApiError(401, "User not authenticated");
      }

      const isAdmin = await hasAdminAccess(userId);
      const orders = isAdmin 
        ? await storage.getOrders() 
        : await storage.getOrders(userId);

      res.json(orders);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.status).json({ message: error.message });
      } else {
        console.error("Error fetching orders:", error);
        res.status(500).json({ message: "Failed to fetch orders" });
      }
    }
  }) as RequestHandler);

  app.get('/api/orders/:id', isAuthenticated, (async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.auth.userId;
      if (!userId) {
        throw new ApiError(401, "User not authenticated");
      }

      const orderId = parseInt(req.params.id);
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        throw new ApiError(404, "Order not found");
      }

      // Check if user owns the order or is an admin
      const isAdmin = await hasAdminAccess(userId);
      if (order.userId !== userId && !isAdmin) {
        throw new ApiError(403, "Access denied");
      }

      res.json(order);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.status).json({ message: error.message });
      } else {
        console.error("Error fetching order:", error);
        res.status(500).json({ message: "Failed to fetch order" });
      }
    }
  }) as RequestHandler);

  app.put('/api/orders/:id/status', isAuthenticated, (async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.auth.userId;
      if (!userId) {
        throw new ApiError(401, "User not authenticated");
      }

      await requireAdminAccess(userId);

      const orderId = parseInt(req.params.id);
      const { status } = req.body;

      if (!status || !['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].includes(status)) {
        throw new ApiError(400, "Invalid status");
      }

      const order = await storage.updateOrderStatus(orderId, status);
      res.json(order);
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.status).json({ message: error.message });
      } else {
        console.error("Error updating order status:", error);
        res.status(500).json({ message: "Failed to update order status" });
      }
    }
  }) as RequestHandler);

  // Coupon routes
  app.post('/api/coupons/validate', async (req, res) => {
    try {
      const { code, amount } = req.body;
      const result = await storage.validateCoupon(code, amount);
      res.json(result);
    } catch (error) {
      console.error("Error validating coupon:", error);
      res.status(500).json({ message: "Failed to validate coupon" });
    }
  });

  // Razorpay payment routes
  app.post("/api/create-order", isAuthenticated, async (req: any, res) => {
    try {
      const { amount, currency = "INR" } = req.body;
      
      const options = {
        amount: amount * 100, // Convert to paise
        currency,
        receipt: `receipt_${Date.now()}`,
      };

      const order = await razorpay.orders.create(options);
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment order", error: error.message });
    }
  });

  app.post("/api/verify-payment", isAuthenticated, async (req: any, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      
      const sign = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSign = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(sign.toString())
        .digest("hex");

      if (razorpay_signature === expectedSign) {
        res.json({ success: true, message: "Payment verified successfully" });
      } else {
        res.status(400).json({ success: false, message: "Invalid signature" });
      }
    } catch (error: any) {
      res.status(500).json({ message: "Error verifying payment", error: error.message });
    }
  });

  // OTP routes
  app.post("/api/send-otp", async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      
      await storage.createOtp({ phoneNumber, otp, expiresAt });
      
      // In production, integrate with SMS service like Twilio
      console.log(`OTP for ${phoneNumber}: ${otp}`);
      
      res.json({ message: "OTP sent successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Error sending OTP", error: error.message });
    }
  });

  app.post("/api/verify-otp", async (req, res) => {
    try {
      const { phoneNumber, otp } = req.body;
      const isValid = await storage.verifyOtp(phoneNumber, otp);
      
      if (isValid) {
        res.json({ success: true, message: "OTP verified successfully" });
      } else {
        res.status(400).json({ success: false, message: "Invalid or expired OTP" });
      }
    } catch (error: any) {
      res.status(500).json({ message: "Error verifying OTP", error: error.message });
    }
  });

  // Reviews routes
  app.get("/api/products/:id/reviews", async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.id);
      const reviews = await storage.getProductReviews(productId);
      
      // Get user details for each review
      const reviewsWithUserDetails = await Promise.all(
        reviews.map(async (review) => {
          const user = await clerkClient.users.getUser(review.userId);
          return {
            ...review,
            user: {
              firstName: user.firstName,
              lastName: user.lastName,
              imageUrl: user.imageUrl,
            }
          };
        })
      );
      
      res.json(reviewsWithUserDetails);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Error fetching reviews", error: (error as Error).message });
    }
  });

  app.post("/api/products/:id/reviews", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.auth.userId;
      if (!userId) {
        throw new ApiError(401, "User not authenticated");
      }

      const productId = parseInt(req.params.id);
      const { rating, title, comment } = req.body;

      // Check if user has purchased the product and it's delivered
      const userOrders = await storage.getOrders(userId);
      const hasPurchased = userOrders.some(order => 
        order.status === 'delivered' && 
        order.orderItems.some(item => item.productId === productId)
      );

      if (!hasPurchased) {
        throw new ApiError(403, "You can only review products you have purchased and received");
      }
      
      const review = await storage.createReview({
        productId,
        userId,
        rating,
        title,
        comment,
      });
      
      // Invalidate the product query to refresh reviews
      res.json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      if (error instanceof ApiError) {
        res.status(error.status).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Error creating review", error: (error as Error).message });
      }
    }
  });

  // Admin Excel export/import routes
  app.get('/api/admin/orders/export', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.auth.userId;
      if (!userId) {
        throw new ApiError(401, "User not authenticated");
      }

      await requireAdminAccess(userId);

      const orders = await storage.getOrders();
      
      // Transform orders data for Excel export
      const excelData = orders.map(order => ({
        'Order ID': order.id,
        'Order Number': order.orderNumber,
        'User ID': order.userId,
        'Status': order.status,
        'Total Amount': parseFloat(order.totalAmount),
        'Payment Method': order.paymentMethod,
        'Payment Status': order.paymentStatus,
        'Shipping Address': order.shippingAddress,
        'Billing Address': order.billingAddress,
        'Notes': order.notes,
        'Created At': order.createdAt?.toISOString(),
        'Updated At': order.updatedAt?.toISOString()
      }));

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

      // Generate buffer
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      // Set headers for file download
      res.setHeader('Content-Disposition', `attachment; filename=orders_${new Date().toISOString().split('T')[0]}.xlsx`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      
      res.send(buffer);
    } catch (error) {
      console.error("Error exporting orders:", error);
      res.status(500).json({ message: "Failed to export orders" });
    }
  });

  app.post('/api/admin/orders/import', isAuthenticated, upload.single('file'), async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.auth.userId;
      if (!userId) {
        throw new ApiError(401, "User not authenticated");
      }

      await requireAdminAccess(userId);

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Parse Excel file
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (!jsonData.length) {
        return res.status(400).json({ message: "Excel file is empty" });
      }

      let processed = 0;
      let updated = 0;
      let added = 0;
      let errors: string[] = [];

      for (const row of jsonData as any[]) {
        try {
          const orderId = row['Order ID'];
          const orderData = {
            orderNumber: row['Order Number'],
            userId: row['User ID'],
            status: row['Status'],
            totalAmount: row['Total Amount']?.toString(),
            paymentMethod: row['Payment Method'],
            paymentStatus: row['Payment Status'],
            shippingAddress: row['Shipping Address'],
            billingAddress: row['Billing Address'],
            notes: row['Notes']
          };

          if (orderId) {
            // Update existing order
            try {
              await storage.updateOrderStatus(orderId, orderData.status);
              updated++;
            } catch (updateError) {
              errors.push(`Failed to update order ID ${orderId}: ${updateError}`);
            }
          } else {
            // This would be for adding new orders, but we don't have a direct method
            // We'll skip for now since orders are typically created through the checkout process
            errors.push(`Skipped row without Order ID`);
          }
          
          processed++;
        } catch (rowError) {
          errors.push(`Error processing row ${processed + 1}: ${rowError}`);
        }
      }

      res.json({
        message: "Import completed",
        summary: {
          processed,
          updated,
          added,
          errors: errors.length
        },
        errors: errors.slice(0, 10) // Limit to first 10 errors
      });

    } catch (error) {
      console.error("Error importing orders:", error);
      res.status(500).json({ message: "Failed to import orders" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
