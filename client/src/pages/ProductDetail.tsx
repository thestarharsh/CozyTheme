import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, ShoppingCart, Heart, Share2, ArrowLeft, Shield, Truck, RotateCcw } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { addToCart, isAdding } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: product, isLoading } = useQuery({
    queryKey: [`/api/products/${id}`],
    enabled: !!id,
    retry: false,
  });

  const { data: relatedProducts = [] } = useQuery({
    queryKey: ["/api/products", product?.brand],
    queryFn: async () => {
      if (!product) return [];
      const response = await fetch(`/api/products?brand=${product.brand}&limit=4`);
      if (!response.ok) throw new Error("Failed to fetch related products");
      const data = await response.json();
      return data.filter((p: any) => p.id !== product.id).slice(0, 4);
    },
    enabled: !!product,
    retry: false,
  });

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({ productId: product.id, quantity });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: product?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Product link has been copied to clipboard",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 animate-pulse">
            <div className="h-96 bg-neutral-200 rounded-xl"></div>
            <div className="space-y-4">
              <div className="h-8 bg-neutral-200 rounded"></div>
              <div className="h-6 bg-neutral-200 rounded w-3/4"></div>
              <div className="h-12 bg-neutral-200 rounded"></div>
              <div className="h-10 bg-neutral-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-neutral-800 mb-4">Product Not Found</h1>
          <p className="text-neutral-600 mb-8">The product you're looking for doesn't exist or has been removed.</p>
          <Link href="/products">
            <Button>Back to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [product.imageUrl];
  const discountPercentage = product.originalPrice 
    ? Math.round(((parseFloat(product.originalPrice) - parseFloat(product.price)) / parseFloat(product.originalPrice)) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 mb-8 text-sm text-neutral-600">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-primary">Products</Link>
          <span>/</span>
          <span className="text-neutral-800">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <div className="aspect-square">
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </Card>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((image: string, index: number) => (
                  <Card
                    key={index}
                    className={`cursor-pointer overflow-hidden ${
                      selectedImage === index ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <div className="aspect-square">
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-neutral-800 mb-2">{product.name}</h1>
                  <p className="text-lg text-neutral-600">{product.brand} {product.model}</p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon" onClick={handleShare}>
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(parseFloat(product.rating || "0"))
                          ? "fill-current"
                          : ""
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-neutral-600">
                  {product.rating} ({product.reviewCount} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl font-bold text-primary">₹{product.price}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-xl text-neutral-400 line-through">
                      ₹{product.originalPrice}
                    </span>
                    <Badge variant="destructive">
                      {discountPercentage}% OFF
                    </Badge>
                  </>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {product.inStock ? (
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    In Stock
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    Out of Stock
                  </Badge>
                )}
              </div>
            </div>

            {/* Product Specs */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-neutral-800 mb-4">Product Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-neutral-600">Brand:</span>
                    <span className="ml-2 font-medium">{product.brand}</span>
                  </div>
                  <div>
                    <span className="text-neutral-600">Model:</span>
                    <span className="ml-2 font-medium">{product.model}</span>
                  </div>
                  <div>
                    <span className="text-neutral-600">Material:</span>
                    <span className="ml-2 font-medium">{product.material}</span>
                  </div>
                  {product.color && (
                    <div>
                      <span className="text-neutral-600">Color:</span>
                      <span className="ml-2 font-medium">{product.color}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-neutral-700">Quantity:</span>
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="px-4 py-2 text-center min-w-[60px]">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full"
                onClick={handleAddToCart}
                disabled={!product.inStock || isAdding}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {isAdding ? "Adding..." : "Add to Cart"}
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center">
                <Shield className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="text-xs text-neutral-600">Quality Guarantee</div>
              </div>
              <div className="text-center">
                <Truck className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="text-xs text-neutral-600">Free Shipping</div>
              </div>
              <div className="text-center">
                <RotateCcw className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="text-xs text-neutral-600">30-Day Returns</div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description and Reviews */}
        <div className="mt-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({product.reviewCount})</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <p className="text-neutral-600 leading-relaxed">
                    {product.description || "No description available for this product."}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-8 text-neutral-600">
                    <Star className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
                    <p>Reviews feature coming soon!</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-neutral-800 mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct: any) => (
                <Link key={relatedProduct.id} href={`/products/${relatedProduct.id}`}>
                  <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <div className="aspect-square overflow-hidden rounded-t-xl">
                      <img
                        src={relatedProduct.imageUrl}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-neutral-800 mb-1 truncate">
                        {relatedProduct.name}
                      </h3>
                      <p className="text-sm text-neutral-500 mb-2">
                        {relatedProduct.brand} {relatedProduct.model}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">
                          ₹{relatedProduct.price}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
