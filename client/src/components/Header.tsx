import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Search, User, ShoppingCart, Menu, Smartphone } from "lucide-react";
import { useUser, useClerk, SignInButton, UserButton } from "@clerk/clerk-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";

export default function Header() {
  const [location, navigate] = useLocation();
  const { user, isSignedIn } = useUser();
  const { user: authUser } = useAuth();
  const { cartCount } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const navLinks = [
    { href: "/", label: "Home", active: location === "/" },
    { href: "/products", label: "Products", active: location.startsWith("/products") },
    { href: "/categories", label: "Categories", active: location === "/categories" },
    { href: "/my-orders", label: "My Orders", active: location === "/my-orders" },
    { href: "/contact", label: "Contact", active: location === "/contact" },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Smartphone className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-neutral-800">CozyGripz</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-6">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className={`text-neutral-600 hover:text-primary transition-colors cursor-pointer ${
                    link.active ? "text-primary font-medium" : ""
                  }`}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="hidden md:flex relative flex-1 max-w-80 mx-8">
            <Input
              type="text"
              placeholder="Search for mobile covers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
          </form>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Remove search button from mobile view */}
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Search className="w-5 h-5" />
            </Button>

            {isSignedIn ? (
              <div className="flex items-center space-x-4">
                {authUser?.role === "admin" && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm">
                      Admin
                    </Button>
                  </Link>
                )}
                <UserButton afterSignOutUrl="/" />
              </div>
            ) : (
              <SignInButton mode="modal">
                <Button variant="ghost" size="icon">
                  <User className="w-5 h-5" />
                </Button>
              </SignInButton>
            )}

            <Link href="/cart">
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
            </Link>

            {/* Mobile Menu */}
            <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-8">
                  {/* Mobile Search */}
                  <form onSubmit={handleSearch} className="relative">
                    <Input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                  </form>

                  {/* Mobile Navigation */}
                  <nav className="flex flex-col space-y-4">
                    {navLinks.map((link) => (
                      <Link key={link.href} href={link.href}>
                        <span
                          className={`text-lg text-neutral-600 hover:text-primary transition-colors cursor-pointer block ${
                            link.active ? "text-primary font-medium" : ""
                          }`}
                          onClick={() => setShowMobileMenu(false)}
                        >
                          {link.label}
                        </span>
                      </Link>
                    ))}
                  </nav>

                  {/* Mobile User Actions */}
                  <div className="border-t pt-4 space-y-2">
                    {isSignedIn ? (
                      <>
                        <div className="text-sm text-neutral-600">
                          Welcome, {user?.firstName || user?.primaryEmailAddress?.emailAddress}!
                        </div>
                      </>
                    ) : (
                      <></>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
