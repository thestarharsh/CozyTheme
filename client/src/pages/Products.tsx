import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/hooks/useCart";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const brands = [
  "Apple", "Samsung", "OnePlus", "Xiaomi", "Oppo", "Vivo", "Realme", "Motorola", "Nokia", "Google"
];
const materials = [
  "Leather", "Silicone", "Hard Plastic", "Metal", "TPU", "Rubber", "Fabric", "Wood", "Glass", "Carbon Fiber"
];
const priceRanges = [
  { label: "Under ₹500", min: 0, max: 500 },
  { label: "₹500 - ₹1000", min: 500, max: 1000 },
  { label: "₹1000 - ₹2000", min: 1000, max: 2000 },
  { label: "Above ₹2000", min: 2000, max: 10000 },
];

export default function Products() {
  const [location] = useLocation();
  const { addToCart } = useCart();
  
  const [filters, setFilters] = useState({
    search: "",
    brands: [] as string[],
    materials: [] as string[],
    priceRange: "",
    sortBy: "popularity",
  });

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Parse URL parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split("?")[1] || "");
    const brand = urlParams.get("brand");
    if (brand) {
      setFilters(prev => ({ ...prev, brands: [brand] }));
    }
  }, [location]);

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    
    if (filters.search) params.append("search", filters.search);
    if (filters.brands.length > 0) params.append("brand", filters.brands[0]);
    if (filters.materials.length > 0) params.append("material", filters.materials[0]);
    
    if (filters.priceRange) {
      const range = priceRanges.find(r => r.label === filters.priceRange);
      if (range) {
        params.append("minPrice", range.min.toString());
        params.append("maxPrice", range.max.toString());
      }
    }
    
    return params.toString();
  };

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["/api/products", buildQueryParams()],
    queryFn: async () => {
      const params = buildQueryParams();
      const response = await fetch(`/api/products?${params}`);
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
    retry: false,
  });

  const handleBrandChange = (brand: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      brands: checked 
        ? [...prev.brands, brand]
        : prev.brands.filter(b => b !== brand)
    }));
  };

  const handleMaterialChange = (material: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      materials: checked 
        ? [...prev.materials, material]
        : prev.materials.filter(m => m !== material)
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      brands: [],
      materials: [],
      priceRange: "",
      sortBy: "popularity",
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container mx-auto px-4">
        {/* Mobile Filters Button */}
        <div className="lg:hidden mb-4 flex justify-end">
          <Button variant="outline" onClick={() => setShowMobileFilters(true)}>
            <Filter className="w-4 h-4 mr-2" />
            Show Filters
          </Button>
        </div>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar (Desktop) */}
          <div className="lg:w-80 flex-shrink-0 hidden lg:block">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-neutral-800">Filters</h3>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                </div>

                {/* Search */}
                <div className="mb-6">
                  <Label className="text-sm font-medium text-neutral-700 mb-3">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                    <Input
                      placeholder="Search products..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                {/* Brand Filter */}
                <div className="mb-6">
                  <Label className="text-sm font-medium text-neutral-700 mb-3">Brand</Label>
                  <div className="space-y-3">
                    {brands.map(brand => (
                      <div key={brand} className="flex items-center space-x-2">
                        <Checkbox
                          id={brand}
                          checked={filters.brands.includes(brand)}
                          onCheckedChange={(checked) => handleBrandChange(brand, checked as boolean)}
                        />
                        <Label htmlFor={brand} className="text-sm text-neutral-600 cursor-pointer">
                          {brand}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Price Range */}
                <div className="mb-6">
                  <Label className="text-sm font-medium text-neutral-700 mb-3">Price Range</Label>
                  <RadioGroup
                    value={filters.priceRange}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value }))}
                  >
                    {priceRanges.map(range => (
                      <div key={range.label} className="flex items-center space-x-2">
                        <RadioGroupItem value={range.label} id={range.label} />
                        <Label htmlFor={range.label} className="text-sm text-neutral-600 cursor-pointer">
                          {range.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                
                {/* Material Filter */}
                <div className="mb-6">
                  <Label className="text-sm font-medium text-neutral-700 mb-3">Material</Label>
                  <div className="space-y-3">
                    {materials.map(material => (
                      <div key={material} className="flex items-center space-x-2">
                        <Checkbox
                          id={material}
                          checked={filters.materials.includes(material)}
                          onCheckedChange={(checked) => handleMaterialChange(material, checked as boolean)}
                        />
                        <Label htmlFor={material} className="text-sm text-neutral-600 cursor-pointer">
                          {material}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Mobile Filters Modal */}
          <Dialog open={showMobileFilters} onOpenChange={setShowMobileFilters}>
            <DialogContent className="p-0 max-w-xs w-full max-h-[90vh] overflow-y-auto">
              <Card className="shadow-none border-none">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-neutral-800">Filters</h3>
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear All
                    </Button>
                  </div>
                  {/* Search */}
                  <div className="mb-6">
                    <Label className="text-sm font-medium text-neutral-700 mb-3">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                      <Input
                        placeholder="Search products..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  {/* Brand Filter */}
                  <div className="mb-6">
                    <Label className="text-sm font-medium text-neutral-700 mb-3">Brand</Label>
                    <div className="space-y-3">
                      {brands.map(brand => (
                        <div key={brand} className="flex items-center space-x-2">
                          <Checkbox
                            id={brand}
                            checked={filters.brands.includes(brand)}
                            onCheckedChange={(checked) => handleBrandChange(brand, checked as boolean)}
                          />
                          <Label htmlFor={brand} className="text-sm text-neutral-600 cursor-pointer">
                            {brand}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Price Range */}
                  <div className="mb-6">
                    <Label className="text-sm font-medium text-neutral-700 mb-3">Price Range</Label>
                    <RadioGroup
                      value={filters.priceRange}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value }))}
                    >
                      {priceRanges.map(range => (
                        <div key={range.label} className="flex items-center space-x-2">
                          <RadioGroupItem value={range.label} id={range.label} />
                          <Label htmlFor={range.label} className="text-sm text-neutral-600 cursor-pointer">
                            {range.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                  {/* Material Filter */}
                  <div className="mb-6">
                    <Label className="text-sm font-medium text-neutral-700 mb-3">Material</Label>
                    <div className="space-y-3">
                      {materials.map(material => (
                        <div key={material} className="flex items-center space-x-2">
                          <Checkbox
                            id={material}
                            checked={filters.materials.includes(material)}
                            onCheckedChange={(checked) => handleMaterialChange(material, checked as boolean)}
                          />
                          <Label htmlFor={material} className="text-sm text-neutral-600 cursor-pointer">
                            {material}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full mt-4" onClick={() => setShowMobileFilters(false)}>
                    Show Products
                  </Button>
                </CardContent>
              </Card>
            </DialogContent>
          </Dialog>
          
          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-2xl font-bold text-neutral-800">
                Mobile Covers
                {products.length > 0 && (
                  <span className="text-lg font-normal text-neutral-600 ml-2">
                    ({products.length} products)
                  </span>
                )}
              </h2>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(12)].map((_, i) => (
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
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📱</div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-2">No products found</h3>
                <p className="text-neutral-600 mb-4">Try adjusting your filters or search terms</p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product: any) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onAddToCart={() => addToCart({ productId: product.id })}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
