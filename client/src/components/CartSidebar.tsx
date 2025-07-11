import { useState } from "react";
import { Link } from "wouter";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingCart, Plus, Minus, Trash2, X } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import type { CartItem, Product } from "@shared/schema";

export default function CartSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    cartItems, 
    cartTotal, 
    cartCount, 
    updateCart, 
    removeFromCart, 
    isUpdating 
  } = useCart();

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateCart({ id: itemId, quantity: newQuantity });
  };

  const handleRemoveItem = (itemId: number) => {
    removeFromCart(itemId);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="w-5 h-5" />
          {cartCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 w-5 h-5 text-xs rounded-full p-0 flex items-center justify-center"
            >
              {cartCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:w-96 flex flex-col h-full">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Shopping Cart</span>
            {cartCount > 0 && (
              <Badge variant="secondary">{cartCount} items</Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
            <ShoppingCart className="w-16 h-16 text-neutral-300" />
            <div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                Your cart is empty
              </h3>
              <p className="text-neutral-600 mb-4">
                Add some products to get started
              </p>
              <Link href="/products">
                <Button onClick={() => setIsOpen(false)}>
                  Start Shopping
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <ScrollArea className="flex-1 pr-6 cart-scroll">
              <div className="space-y-4 py-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <img
                      src={item.product ? item.product.imageUrl : ''}
                      alt={item.product ? item.product.name : 'Product'}
                      className="w-16 h-16 object-contain rounded"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-lg">
                        {item.product ? item.product.name : 'Unknown Product'}
                      </div>
                      <div className="text-sm text-neutral-600">
                        {item.product ? `${item.product.brand} ${item.product.model}` : ''}
                      </div>
                      <div className="text-sm font-medium mt-1">
                        ₹{item.product ? item.product.price : '0'}
                      </div>
                      <div className="text-xs text-neutral-500">
                        Total: ₹{item.product ? (parseFloat(item.product.price) * item.quantity).toFixed(2) : '0.00'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Cart Footer */}
            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-neutral-800">Total:</span>
                <span className="text-xl font-bold text-primary">
                  ₹{cartTotal.toFixed(2)}
                </span>
              </div>

              <Separator />

              <div className="space-y-3">
                <Link href="/cart">
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => setIsOpen(false)}
                  >
                    View Cart & Checkout
                  </Button>
                </Link>
                
                <Link href="/products">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setIsOpen(false)}
                  >
                    Continue Shopping
                  </Button>
                </Link>
              </div>

              {cartTotal >= 99 ? (
                <p className="text-xs text-green-600 text-center">
                  🎉 You qualify for free shipping!
                </p>
              ) : (
                <p className="text-xs text-neutral-500 text-center">
                  Add ₹{(99 - cartTotal).toFixed(2)} more for free shipping
                </p>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
