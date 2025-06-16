import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Package, Users, ShoppingCart, TrendingUp, Eye, Download, Upload } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

const adminAccessEmails = [
  'testdevbyharsh@gmail.com',
  "cozygripzdev@gmail.com",
];

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  originalPrice?: string;
  brand: string;
  model: string;
  material: string;
  color?: string;
  imageUrl: string;
  inStock: boolean;
  stockQuantity: number;
  featured: boolean;
  createdAt: string;
}

interface Order {
  id: number;
  orderNumber: string;
  userId: string;
  status: string;
  totalAmount: string;
  paymentMethod: string;
  createdAt: string;
  orderItems: {
    id: number;
    productId: number;
    quantity: number;
    price: string;
    product: {
      id: number;
      name: string;
      brand: string;
      model: string;
    };
  }[];
  shippingAddress: {
    fullName: string;
    email: string;
    phoneNumber: string;
    address: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
}

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  originalPrice?: string;
  brand: string;
  model: string;
  material: string;
  color?: string;
  image: File | null;
  stockQuantity: number;
  featured: boolean;
}

export default function Admin() {
  const { user, isSignedIn } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [productForm, setProductForm] = useState<ProductFormData>({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    brand: "",
    model: "",
    material: "",
    color: "",
    image: null,
    stockQuantity: 0,
    featured: false,
  });

  // Queries
  const { data: products = [] as Product[] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    retry: false,
  });

  const { data: orders = [] as Order[] } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    retry: false,
  });

  // Redirect if not admin
  useEffect(() => {
    if (!isSignedIn) {
      toast({
        title: "Access Denied",
        description: "Please sign in to access admin panel",
        variant: "destructive",
      });
      window.location.href = "/sign-in";
      return;
    }
    
    const userEmail = user?.primaryEmailAddress?.emailAddress;
    if (!userEmail || !adminAccessEmails.includes(userEmail)) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges",
        variant: "destructive",
      });
      window.location.href = "/";
      return;
    }
  }, [isSignedIn, user, toast]);

  // Mutations
  const createProductMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/products', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to create product');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsProductModalOpen(false);
      resetProductForm();
      toast({ title: "Success", description: "Product created successfully" });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized", 
          description: "Your session has expired. Please sign in again.",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 1000);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create product",
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: number; formData: FormData }) => {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to update product');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsProductModalOpen(false);
      resetProductForm();
      toast({ title: "Success", description: "Product updated successfully" });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized", 
          description: "Your session has expired. Please sign in again.",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 1000);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product deleted successfully" });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Your session has expired. Please sign in again.",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 1000);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PUT", `/api/orders/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "Order status updated successfully" });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Your session has expired. Please sign in again.",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 1000);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    },
  });

  // Excel export/import mutations
  const exportOrdersMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin/orders/export', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `orders_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({ title: "Orders exported successfully" });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Your session has expired. Please sign in again.",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 1000);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to export orders",
        variant: "destructive",
      });
    },
  });

  const importOrdersMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/admin/orders/import', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Import failed');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      setIsImportModalOpen(false);
      setImportFile(null);
      toast({ 
        title: "Import completed",
        description: `Processed: ${data.summary.processed}, Updated: ${data.summary.updated}, Errors: ${data.summary.errors}`
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized", 
          description: "Your session has expired. Please sign in again.",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 1000);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to import orders",
        variant: "destructive",
      });
    },
  });

  const resetProductForm = () => {
    setProductForm({
      name: "",
      description: "",
      price: "",
      originalPrice: "",
      brand: "",
      model: "",
      material: "",
      color: "",
      image: null,
      stockQuantity: 0,
      featured: false,
    });
    setSelectedProduct(null);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice || "",
      brand: product.brand,
      model: product.model,
      material: product.material,
      color: product.color || "",
      image: null,
      stockQuantity: product.stockQuantity,
      featured: product.featured,
    });
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    
    // Append all form fields with proper type conversion
    Object.entries(productForm).forEach(([key, value]) => {
      if (key !== 'image' && value !== null) {
        if (key === 'stockQuantity') {
          formData.append(key, value.toString());
        } else if (key === 'featured') {
          formData.append(key, value.toString());
        } else if (key === 'price' || key === 'originalPrice') {
          formData.append(key, value.toString());
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    // Append image if exists
    if (productForm.image) {
      formData.append('image', productForm.image);
    } else if (!selectedProduct) {
      // If it's a new product and no image is selected
      toast({
        title: "Error",
        description: "Please select an image for the product",
        variant: "destructive",
      });
      return;
    }

    try {
      if (selectedProduct) {
        await updateProductMutation.mutateAsync({ id: selectedProduct.id, formData });
      } else {
        await createProductMutation.mutateAsync(formData);
      }
    } catch (error) {
      console.error('Error submitting product:', error);
    }
  };

  // Calculate stats
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum: number, order: Order) => sum + parseFloat(order.totalAmount), 0);
  const pendingOrders = orders.filter((order: Order) => order.status === 'pending').length;

  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-neutral-800">Admin Dashboard</h1>
          <Badge variant="secondary">
            Welcome, {user?.firstName || user?.emailAddresses[0]?.emailAddress}
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Total Products</p>
                  <p className="text-2xl font-bold text-primary">{totalProducts}</p>
                </div>
                <Package className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Total Orders</p>
                  <p className="text-2xl font-bold text-primary">{totalOrders}</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-primary">₹{totalRevenue.toFixed(2)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Pending Orders</p>
                  <p className="text-2xl font-bold text-primary">{pendingOrders}</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Products Management</CardTitle>
                  <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={resetProductForm}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {selectedProduct ? "Edit Product" : "Add New Product"}
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleProductSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">Product Name</Label>
                            <Input
                              id="name"
                              value={productForm.name}
                              onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="brand">Brand</Label>
                            <Input
                              id="brand"
                              value={productForm.brand}
                              onChange={(e) => setProductForm(prev => ({ ...prev, brand: e.target.value }))}
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="model">Model</Label>
                            <Input
                              id="model"
                              value={productForm.model}
                              onChange={(e) => setProductForm(prev => ({ ...prev, model: e.target.value }))}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="material">Material</Label>
                            <Input
                              id="material"
                              value={productForm.material}
                              onChange={(e) => setProductForm(prev => ({ ...prev, material: e.target.value }))}
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={productForm.description}
                            onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="price">Price (₹)</Label>
                            <Input
                              id="price"
                              type="number"
                              step="0.01"
                              value={productForm.price}
                              onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="originalPrice">Original Price (₹)</Label>
                            <Input
                              id="originalPrice"
                              type="number"
                              step="0.01"
                              value={productForm.originalPrice}
                              onChange={(e) => setProductForm(prev => ({ ...prev, originalPrice: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="stockQuantity">Stock Quantity</Label>
                            <Input
                              id="stockQuantity"
                              type="number"
                              value={productForm.stockQuantity}
                              onChange={(e) => setProductForm(prev => ({ ...prev, stockQuantity: parseInt(e.target.value) || 0 }))}
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="color">Color</Label>
                            <Input
                              id="color"
                              value={productForm.color}
                              onChange={(e) => setProductForm(prev => ({ ...prev, color: e.target.value }))}
                            />
                          </div>
                          <div className="flex items-center space-x-2 pt-6">
                            <Switch
                              id="featured"
                              checked={productForm.featured}
                              onCheckedChange={(checked) => setProductForm(prev => ({ ...prev, featured: checked }))}
                            />
                            <Label htmlFor="featured">Featured Product</Label>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="image">Product Image</Label>
                          <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 5 * 1024 * 1024) { // 5MB limit
                                  toast({
                                    title: "Error",
                                    description: "Image size should be less than 5MB",
                                    variant: "destructive",
                                  });
                                  e.target.value = ''; // Clear the file input
                                  return;
                                }
                                if (!file.type.startsWith('image/')) {
                                  toast({
                                    title: "Error",
                                    description: "Please upload an image file",
                                    variant: "destructive",
                                  });
                                  e.target.value = ''; // Clear the file input
                                  return;
                                }
                                setProductForm(prev => ({ ...prev, image: file }));
                                toast({
                                  title: "Success",
                                  description: "Image selected successfully",
                                });
                              }
                            }}
                            required={!selectedProduct} // Only required for new products
                          />
                          <p className="mt-1 text-sm text-gray-500">
                            Max file size: 5MB. Supported formats: JPG, JPEG, PNG, GIF
                          </p>
                          {productForm.image && (
                            <p className="mt-1 text-sm text-green-600">
                              Image selected: {productForm.image.name}
                            </p>
                          )}
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setIsProductModalOpen(false)}>
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={createProductMutation.isPending || updateProductMutation.isPending}
                          >
                            {selectedProduct ? "Update" : "Create"} Product
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Brand/Model</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product: Product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                            <div>
                              <div className="font-medium">{product.name}</div>
                              {product.featured && (
                                <Badge variant="secondary" className="text-xs">Featured</Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{product.brand}</div>
                            <div className="text-neutral-500">{product.model}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">₹{product.price}</div>
                            {product.originalPrice && (
                              <div className="text-neutral-500 line-through">₹{product.originalPrice}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={product.stockQuantity > 0 ? "secondary" : "destructive"}>
                            {product.stockQuantity} units
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={product.inStock ? "secondary" : "destructive"}>
                            {product.inStock ? "In Stock" : "Out of Stock"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => deleteProductMutation.mutate(product.id)}
                              disabled={deleteProductMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Orders Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price/Unit</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order: Order) => (
                      order.orderItems?.map((item, index) => (
                        <TableRow key={`${order.id}-${item.id}`}>
                          {index === 0 ? (
                            <>
                              <TableCell className="font-medium">{order.orderNumber}</TableCell>
                              <TableCell>{order.shippingAddress.fullName}</TableCell>
                              <TableCell>{order.shippingAddress.phoneNumber}</TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell></TableCell>
                              <TableCell></TableCell>
                              <TableCell></TableCell>
                            </>
                          )}
                          <TableCell>{item.product.name}</TableCell>
                          <TableCell>{item.product.brand}</TableCell>
                          <TableCell>{item.product.model}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>₹{item.price}</TableCell>
                          {index === 0 ? (
                            <>
                              <TableCell>
                                {`${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state}, ${order.shippingAddress.pincode}`}
                              </TableCell>
                              <TableCell>₹{order.totalAmount}</TableCell>
                              <TableCell>
                                <Badge variant={order.paymentMethod === 'online' ? 'secondary' : 'outline'}>
                                  {order.paymentMethod === 'online' ? 'Online' : 'COD'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={order.status}
                                  onValueChange={(status) => updateOrderStatusMutation.mutate({ id: order.id, status })}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                    <SelectItem value="shipped">Shipped</SelectItem>
                                    <SelectItem value="delivered">Delivered</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                {new Date(order.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <Button variant="outline" size="icon">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell></TableCell>
                              <TableCell></TableCell>
                              <TableCell></TableCell>
                              <TableCell></TableCell>
                              <TableCell></TableCell>
                              <TableCell></TableCell>
                            </>
                          )}
                        </TableRow>
                      ))
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
