import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingBag, CreditCard, Truck } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Cart() {
  const { cartItems, cartTotal, updateCart, removeFromCart, isUpdating } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    address: user?.address || "",
    pincode: user?.pincode || "",
    city: user?.city || "",
    state: user?.state || "",
    country: "India",
  });
  
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
    onSuccess: (order) => {
      toast({
        title: "Order placed successfully!",
        description: `Your order #${order.orderNumber} has been confirmed.`,
      });
      // Redirect to order confirmation or home
      window.location.href = "/";
    },
    onError: (error) => {
      toast({
        title: "Order failed",
        description: "There was an error placing your order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const validateCouponMutation = useMutation({
    mutationFn: async ({ code, amount }: { code: string; amount: number }) => {
      const response = await apiRequest("POST", "/api/coupons/validate", { code, amount });
      return response.json();
    },
    onSuccess: (result) => {
      if (result.valid) {
        setDiscount(result.discount || 0);
        toast({
          title: "Coupon applied!",
          description: `You saved ₹${result.discount}`,
        });
      } else {
        toast({
          title: "Invalid coupon",
          description: result.message || "This coupon is not valid",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to validate coupon",
        variant: "destructive",
      });
    },
  });

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateCart({ id: itemId, quantity: newQuantity });
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    validateCouponMutation.mutate({ code: couponCode, amount: cartTotal });
  };

  const handlePlaceOrder = () => {
    if (!isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to place an order",
        variant: "destructive",
      });
      window.location.href = "/api/login";
      return;
    }

    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some items to your cart first",
        variant: "destructive",
      });
      return;
    }

    // Validate shipping info
    const requiredFields = ["fullName", "phoneNumber", "address", "pincode", "city", "state"];
    const missingFields = requiredFields.filter(field => !shippingInfo[field as keyof typeof shippingInfo]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing information",
        description: "Please fill in all required shipping details",
        variant: "destructive",
      });
      return;
    }

    const orderItems = cartItems.map((item: any) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.product.price,
    }));

    const finalAmount = cartTotal - discount;

    createOrderMutation.mutate({
      items: orderItems,
      shippingAddress: shippingInfo,
      paymentMethod,
      totalAmount: finalAmount,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto">
            <ShoppingBag className="w-24 h-24 text-neutral-300 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-neutral-800 mb-4">Sign in Required</h1>
            <p className="text-neutral-600 mb-8">Please sign in to view your cart and place orders.</p>
            <Button size="lg" onClick={() => window.location.href = "/api/login"}>
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto">
            <ShoppingBag className="w-24 h-24 text-neutral-300 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-neutral-800 mb-4">Your cart is empty</h1>
            <p className="text-neutral-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
            <Link href="/products">
              <Button size="lg">Start Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const finalTotal = cartTotal - discount;

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-neutral-800 mb-8">Shopping Cart</h1>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cart Items ({cartItems.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item: any) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-neutral-800">{item.product.name}</h3>
                      <p className="text-sm text-neutral-500">
                        {item.product.brand} {item.product.model}
                      </p>
                      <p className="text-lg font-bold text-primary">₹{item.product.price}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || isUpdating}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-12 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={isUpdating}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={shippingInfo.fullName}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      value={shippingInfo.phoneNumber}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter your complete address"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      value={shippingInfo.pincode}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, pincode: e.target.value }))}
                      placeholder="Enter pincode"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={shippingInfo.state}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="Enter state"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            {/* Coupon */}
            <Card>
              <CardHeader>
                <CardTitle>Apply Coupon</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <Button 
                    onClick={handleApplyCoupon}
                    disabled={validateCouponMutation.isPending}
                  >
                    Apply
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex items-center cursor-pointer">
                      <Truck className="w-4 h-4 mr-2" />
                      Cash on Delivery
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="online" id="online" />
                    <Label htmlFor="online" className="flex items-center cursor-pointer">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Online Payment
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{cartTotal.toFixed(2)}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-green-600">
                    {cartTotal >= 999 ? "Free" : "₹99"}
                  </span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">
                    ₹{(finalTotal + (cartTotal >= 999 ? 0 : 99)).toFixed(2)}
                  </span>
                </div>
                
                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={handlePlaceOrder}
                  disabled={createOrderMutation.isPending}
                >
                  {createOrderMutation.isPending ? "Placing Order..." : "Place Order"}
                </Button>
                
                <p className="text-xs text-neutral-500 text-center">
                  By placing this order, you agree to our terms and conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
