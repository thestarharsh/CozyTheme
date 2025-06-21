import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Shield, Smartphone } from "lucide-react";
import { useUser } from "@clerk/clerk-react";

export default function MyOrders() {
  const { isSignedIn } = useUser();

  const { data: userOrders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ["/api/orders"],
    retry: false,
    enabled: isSignedIn,
  });

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-4">My Orders</h1>
          <p className="text-neutral-600 max-w-2xl mx-auto">Track your orders and their current status</p>
        </div>

        {loadingOrders ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-neutral-200 rounded-t-xl"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                  <div className="h-3 bg-neutral-200 rounded mb-2"></div>
                  <div className="h-6 bg-neutral-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : userOrders.length === 0 ? (
          <div className="max-w-2xl mx-auto">
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto text-neutral-400 mb-4" />
              <h3 className="text-xl font-semibold text-neutral-800 mb-2">No Orders Yet</h3>
              <p className="text-neutral-600 mb-6">Start shopping to see your orders here</p>
              <Link href="/products">
                <Button>Start Shopping</Button>
              </Link>
            </div>

            {/* Fun Story Section */}
            <Card className="mt-12">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-8 h-8 text-primary" />
                  <h2 className="text-xl font-semibold text-neutral-800">The Tale of the Unprotected Phone</h2>
                </div>
                <div className="space-y-4 text-neutral-600">
                  <p>
                    Once upon a time, there was a smartphone named Pixel who thought it was too cool for a case. "I'm sleek! I'm modern! I don't need protection!" it boasted.
                  </p>
                  <p>
                    One day, while showing off its slim design, Pixel took a tumble from its owner's pocket. The concrete floor wasn't impressed by its sleekness, and Pixel learned a valuable lesson about the importance of protection.
                  </p>
                  <p>
                    Moral of the story: Even the most advanced technology needs a guardian. That's where CozyGripz comes in - we're not just selling cases, we're selling peace of mind!
                  </p>
                  <div className="flex items-center gap-2 text-sm text-neutral-500">
                    <Smartphone className="w-4 h-4" />
                    <span>Protect your phone, protect your investment!</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userOrders.map((order: any) => (
              order.orderItems?.map((item: any) => (
                <Card key={`${order.id}-${item.id}`} className="overflow-hidden">
                  <div className="relative">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-full h-48 object-contain bg-white"
                    />
                    <Badge 
                      variant={
                        order.status === 'delivered' ? 'default' :
                        order.status === 'shipped' ? 'secondary' :
                        order.status === 'cancelled' ? 'destructive' :
                        'outline'
                      }
                      className="absolute top-2 right-2"
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{item.product.name}</h3>
                      <div className="text-sm text-neutral-600">
                        <p>{item.product.brand} - {item.product.model}</p>
                        <p>Quantity: {item.quantity}</p>
                        <p>Price: ₹{item.price} each</p>
                        <p className="font-medium">Total: ₹{order.totalAmount}</p>
                      </div>
                      <div className="text-xs text-neutral-500">
                        Order #{order.orderNumber}
                      </div>
                      {order.trackingNumber && (
                        <div className="text-xs text-neutral-500 pt-1">
                          <strong>Tracking ID:</strong> {order.trackingNumber}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 