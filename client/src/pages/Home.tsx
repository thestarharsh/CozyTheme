import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Shield, Truck, HeartHandshake, Zap, Package } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/hooks/useCart";
import { useUser } from "@clerk/clerk-react";
import SnakeGame from "@/components/SnakeGame";
import type { Product } from "@shared/schema";

const brands = [
  { name: "Apple", icon: "📱", tagline: "Premium" },
  { name: "Samsung", icon: "📱", tagline: "Innovation" },
  { name: "OnePlus", icon: "📱", tagline: "Flagship" },
  { name: "Xiaomi", icon: "📱", tagline: "Style" },
  { name: "Oppo", icon: "📱", tagline: "Trendy" },
  { name: "Vivo", icon: "📱", tagline: "Sleek" },
];


const accessories = [
  {
    title: "Screen Protectors",
    description: "Tempered glass protection for all devices",
    image: "https://plus.unsplash.com/premium_photo-1681702307639-1b3b0d7a5d7c?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8c2NyZWVuJTIwcHJvdGVjdG9yfGVufDB8fDB8fHww"
  },
  {
    title: "Wireless Chargers",
    description: "Fast and efficient charging solutions",
    image: "https://images.unsplash.com/photo-1681382659831-2f3b16748a64?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGlwaG9uZSUyMGNoYXJnaW5nfGVufDB8fDB8fHww"
  },
  {
    title: "Phone Stands",
    description: "Adjustable stands for hands-free use",
    image: "https://images.unsplash.com/photo-1553556135-009e5858adce?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cGhvbmUlMjBzdGFuZHxlbnwwfHwwfHx8MA%3D%3D"
  },
];

const testimonials = [
  {
    name: "Bhushan Koli",
    location: "Mumbai",
    rating: 5,
    comment: "Amazing quality and fast delivery! The silicone case I ordered exceeded my expectations. Perfect fit for my iPhone."
  },
  {
    name: "Saniya Gehani",
    location: "Udaipur",
    rating: 5,
    comment: "Best customer service and product quality. Feeling satified after buying from CozyGripz. Highly recommended!"
  },
  {
    name: "Dhruvi Shah",
    location: "Ahmedabad",
    rating: 5,
    comment: "The rugged case saved my phone from multiple drops. Excellent protection without compromising on style."
  },
];

const features = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On orders above ₹99"
  },
  {
    icon: HeartHandshake,
    title: "24/7 Support",
    description: "Always here to help"
  },
  {
    icon: Shield,
    title: "Quality Guarantee",
    description: "Backed by Our Promise"
  },
  {
    icon: Zap,
    title: "Fast Delivery",
    description: "6-14 business days"
  },
];

export default function Home() {
  const [email, setEmail] = useState("");
  const { addToCart } = useCart();
  const { isSignedIn } = useUser();

  const { data: featuredProducts = [], isLoading: loadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products/featured"],
    retry: false,
  });

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    setEmail("");
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-secondary via-white to-secondary py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-6xl font-bold text-neutral-800 mb-6">
                Not Just <span className="text-primary italic">Covers</span><br /> A Cozy Revolution
              </h1>
              <p className="text-lg text-neutral-600 mb-8 max-w-lg mx-auto lg:mx-0">
                Discover premium mobile covers that combine ultimate protection with stunning design. Because your phone deserves the best.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/products">
                  <Button size="lg" className="bg-primary hover:bg-red-600">
                    Shop Now
                  </Button>
                </Link>
                <Link href="/products">
                  <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-white">
                    View Collections
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Collection of colorful smartphone cases" 
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
              <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-lg shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">500+ Happy Customers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Showcase */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-4">Shop by Brand</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">Find the perfect cover for your device from our extensive collection</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {brands.map((brand, index) => (
              <Link key={index} href={`/products?brand=${brand.name}`}>
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-3">{brand.icon}</div>
                    <h3 className="font-semibold text-neutral-800 mb-1">{brand.name}</h3>
                    <p className="text-sm italic text-neutral-500">{brand.tagline}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-4">Featured Products</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">Our top-rated mobile covers loved by customers</p>
          </div>
          
          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-64 bg-neutral-200 rounded-t-xl"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                    <div className="h-3 bg-neutral-200 rounded mb-2"></div>
                    <div className="h-6 bg-neutral-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={() => addToCart({ productId: product.id })} />
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link href="/products">
              <Button variant="outline" size="lg">
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Accessories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-4">Complete Your Setup</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">Enhance your mobile experience with our premium accessories</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {accessories.map((accessory, index) => (
              <Card key={index} className="group cursor-pointer hover:shadow-lg transition-all duration-300">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden rounded-t-xl">
                    <img 
                      src={accessory.image}
                      alt={accessory.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-neutral-800 mb-2">{accessory.title}</h3>
                    <p className="text-neutral-600 mb-4">{accessory.description}</p>
                    <Button variant="link" className="text-primary p-0">
                      Coming Soon →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gradient-to-br from-secondary/30 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-4">What Our Customers Say</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">Join hundreds of satisfied customers who trust CozyGripz</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="shadow-sm">
                <CardContent className="p-6">
                  <div className="flex text-yellow-400 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-neutral-600 mb-4">"{testimonial.comment}"</p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center text-lg font-semibold text-neutral-700 mr-3">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-800">{testimonial.name}</h4>
                      <p className="text-sm text-neutral-500">{testimonial.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-4">Why Choose CozyGripz?</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">Experience the difference with our premium service</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-800 mb-2">{feature.title}</h3>
                <p className="text-neutral-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gradient-to-br from-primary to-red-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Stay Updated</h2>
          <p className="text-red-100 mb-8 max-w-2xl mx-auto">Get the latest offers, new arrivals, and exclusive deals delivered to your inbox</p>
          
          <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input 
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white focus:outline-none"
                required
              />
              <Button type="submit" className="bg-white text-primary hover:bg-neutral-100">
                Subscribe
              </Button>
            </div>
            <p className="text-red-100 text-sm mt-3">No spam, unsubscribe anytime</p>
          </form>
        </div>
      </section>

      {/* Game Section */}
      <section className="py-20 bg-gradient-to-b from-neutral-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-4">
              Not interested in buying covers right now?
            </h2>
            <p className="text-neutral-600 max-w-2xl mx-auto mb-2">
              No problem just play a game
            </p>
            <p className="text-sm text-neutral-500">
              Enjoy our classic Snake game while browsing
            </p>
          </div>
          
          <div className="flex justify-center">
            <SnakeGame />
          </div>
        </div>
      </section>
    </div>
  );
}
