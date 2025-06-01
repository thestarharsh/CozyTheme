import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { X, Filter } from "lucide-react";

interface FilterOptions {
  brands: string[];
  materials: string[];
  priceRange: [number, number];
  sortBy: string;
  inStock: boolean;
}

interface CategoryFilterProps {
  filters: FilterOptions;
  onFiltersChange: (filters: Partial<FilterOptions>) => void;
  onClearFilters: () => void;
  className?: string;
}

const AVAILABLE_BRANDS = [
  "iPhone", "Samsung", "OnePlus", "Xiaomi", "Oppo", "Vivo", "Realme", "Google", "Nothing"
];

const AVAILABLE_MATERIALS = [
  "Silicone", "Leather", "Hard Plastic", "Metal", "TPU", "Fabric", "Wood", "Carbon Fiber"
];

const SORT_OPTIONS = [
  { value: "popularity", label: "Popularity" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "rating", label: "Highest Rated" },
];

export default function CategoryFilter({ 
  filters, 
  onFiltersChange, 
  onClearFilters, 
  className = "" 
}: CategoryFilterProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>(filters.priceRange);

  const handleBrandChange = (brand: string, checked: boolean) => {
    const newBrands = checked 
      ? [...filters.brands, brand]
      : filters.brands.filter(b => b !== brand);
    onFiltersChange({ brands: newBrands });
  };

  const handleMaterialChange = (material: string, checked: boolean) => {
    const newMaterials = checked 
      ? [...filters.materials, material]
      : filters.materials.filter(m => m !== material);
    onFiltersChange({ materials: newMaterials });
  };

  const handlePriceRangeChange = (value: number[]) => {
    const newRange: [number, number] = [value[0], value[1]];
    setPriceRange(newRange);
  };

  const handlePriceRangeCommit = () => {
    onFiltersChange({ priceRange });
  };

  const getActiveFiltersCount = () => {
    return filters.brands.length + filters.materials.length + 
           (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000 ? 1 : 0) +
           (filters.inStock ? 1 : 0);
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card className={`sticky top-24 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount}</Badge>
            )}
          </CardTitle>
          {activeFiltersCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClearFilters}
              className="text-primary hover:text-primary"
            >
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Sort By */}
        <div>
          <Label className="text-sm font-medium text-neutral-700 mb-3 block">
            Sort By
          </Label>
          <RadioGroup
            value={filters.sortBy}
            onValueChange={(value) => onFiltersChange({ sortBy: value })}
          >
            {SORT_OPTIONS.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label 
                  htmlFor={option.value} 
                  className="text-sm text-neutral-600 cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Price Range */}
        <div>
          <Label className="text-sm font-medium text-neutral-700 mb-4 block">
            Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
          </Label>
          <Slider
            value={priceRange}
            onValueChange={handlePriceRangeChange}
            onValueCommit={handlePriceRangeCommit}
            max={10000}
            min={0}
            step={100}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-neutral-500 mt-2">
            <span>₹0</span>
            <span>₹10,000</span>
          </div>
        </div>

        {/* Brands */}
        <div>
          <Label className="text-sm font-medium text-neutral-700 mb-3 block">
            Brands
          </Label>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {AVAILABLE_BRANDS.map((brand) => (
              <div key={brand} className="flex items-center space-x-2">
                <Checkbox
                  id={brand}
                  checked={filters.brands.includes(brand)}
                  onCheckedChange={(checked) => 
                    handleBrandChange(brand, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={brand} 
                  className="text-sm text-neutral-600 cursor-pointer flex-1"
                >
                  {brand}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Materials */}
        <div>
          <Label className="text-sm font-medium text-neutral-700 mb-3 block">
            Materials
          </Label>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {AVAILABLE_MATERIALS.map((material) => (
              <div key={material} className="flex items-center space-x-2">
                <Checkbox
                  id={material}
                  checked={filters.materials.includes(material)}
                  onCheckedChange={(checked) => 
                    handleMaterialChange(material, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={material} 
                  className="text-sm text-neutral-600 cursor-pointer flex-1"
                >
                  {material}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Stock Status */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="inStock"
            checked={filters.inStock}
            onCheckedChange={(checked) => 
              onFiltersChange({ inStock: checked as boolean })
            }
          />
          <Label 
            htmlFor="inStock" 
            className="text-sm text-neutral-600 cursor-pointer"
          >
            In Stock Only
          </Label>
        </div>

        {/* Active Filters Summary */}
        {activeFiltersCount > 0 && (
          <div>
            <Label className="text-sm font-medium text-neutral-700 mb-3 block">
              Active Filters
            </Label>
            <div className="flex flex-wrap gap-2">
              {filters.brands.map((brand) => (
                <Badge key={brand} variant="secondary" className="flex items-center space-x-1">
                  <span>{brand}</span>
                  <X 
                    className="w-3 h-3 cursor-pointer hover:text-red-500" 
                    onClick={() => handleBrandChange(brand, false)}
                  />
                </Badge>
              ))}
              {filters.materials.map((material) => (
                <Badge key={material} variant="secondary" className="flex items-center space-x-1">
                  <span>{material}</span>
                  <X 
                    className="w-3 h-3 cursor-pointer hover:text-red-500" 
                    onClick={() => handleMaterialChange(material, false)}
                  />
                </Badge>
              ))}
              {(filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>₹{filters.priceRange[0]}-₹{filters.priceRange[1]}</span>
                  <X 
                    className="w-3 h-3 cursor-pointer hover:text-red-500" 
                    onClick={() => onFiltersChange({ priceRange: [0, 10000] })}
                  />
                </Badge>
              )}
              {filters.inStock && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>In Stock</span>
                  <X 
                    className="w-3 h-3 cursor-pointer hover:text-red-500" 
                    onClick={() => onFiltersChange({ inStock: false })}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
