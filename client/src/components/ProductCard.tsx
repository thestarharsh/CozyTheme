import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Heart } from "lucide-react";

interface Product {
  id: number;
  name: string;
  description?: string;
  price: string;
  originalPrice?: string;
  brand: string;
  model: string;
  imageUrl: string;
  rating?: string;
  reviewCount?: number;
  featured?: boolean;
  inStock?: boolean;
  tags?: string[];
}

interface ProductCardProps {
  product: Product;
  onAddToCart: () => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [isWishlist, setIsWishlist] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const discountPercentage = product.originalPrice 
    ? Math.round(((parseFloat(product.originalPrice) - parseFloat(product.price)) / parseFloat(product.originalPrice)) * 100)
    : 0;

  const rating = parseFloat(product.rating || "0");
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart();
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlist(!isWishlist);
  };

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="group cursor-pointer product-hover overflow-hidden">
        <div className="relative overflow-hidden">
          {!imageLoaded && (
            <div className="w-full h-64 bg-neutral-200 animate-pulse rounded-t-xl"></div>
          )}
          <img
            src={product.imageUrl}
            alt={product.name}
            className={`w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105 ${
              imageLoaded ? 'block' : 'hidden'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col space-y-2">
            {product.featured && (
              <Badge className="bg-green-500 hover:bg-green-600">
                Bestseller
              </Badge>
            )}
            {discountPercentage > 0 && (
              <Badge className="bg-primary hover:bg-red-600">
                {discountPercentage}% OFF
              </Badge>
            )}
            {product.tags?.includes('new') && (
              <Badge className="bg-blue-500 hover:bg-blue-600">
                New
              </Badge>
            )}
          </div>
          
          {/* Wishlist Button */}
          <Button
            variant="secondary"
            size="icon"
            className={`absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity ${
              isWishlist ? 'text-red-500' : ''
            }`}
            onClick={handleWishlistToggle}
          >
            <Heart className={`w-4 h-4 ${isWishlist ? 'fill-current' : ''}`} />
          </Button>

          {/* Stock Status Overlay */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive" className="text-lg">
                Out of Stock
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-neutral-800 line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            
            <p className="text-sm text-neutral-500">
              {product.brand} {product.model}
            </p>

            {/* Rating */}
            {product.rating && parseFloat(product.rating) > 0 && (
              <div className="flex items-center space-x-1">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < fullStars 
                          ? 'fill-current' 
                          : i === fullStars && hasHalfStar 
                          ? 'fill-current opacity-50' 
                          : ''
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-neutral-500">
                  ({product.reviewCount || 0})
                </span>
              </div>
            )}

            {/* Price and Add to Cart */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-primary">
                  ₹{product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-neutral-400 line-through">
                    ₹{product.originalPrice}
                  </span>
                )}
              </div>
              
              <Button
                size="icon"
                className="bg-primary hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                <ShoppingCart className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
