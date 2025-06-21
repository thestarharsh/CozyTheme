import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider, SignIn, SignUp, useUser } from "@clerk/clerk-react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Admin from "@/pages/Admin";
import MyOrders from "@/pages/MyOrders";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ProductForm } from './components/ProductForm';
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import AboutUs from "./pages/AboutUs";

function Router() {
  const { isSignedIn, isLoaded } = useUser();
  const [location] = useLocation();

  if (!isLoaded) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-gray-300 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }
  
  const isAuthPage = location === "/sign-in" || location === "/sign-up";

  return (
    <div className="min-h-screen flex flex-col">
      {!isAuthPage && <Header />}

      <main className={`flex-1 ${isAuthPage ? "flex items-center justify-center" : ""}`}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/products" component={Products} />
          <Route path="/products/:id" component={ProductDetail} />
          <Route path="/cart" component={Cart} />
          <Route path="/my-orders" component={MyOrders} />
          <Route path="/privacy-policy" component={PrivacyPolicy} />
          <Route path="/terms-of-service" component={TermsOfService} />
          <Route path="/about-us" component={AboutUs} />
          <Route path="/sign-in">
            {/* Centered SignIn */}
            <div className="w-full max-w-md p-6 bg-white rounded-md shadow-md">
              <SignIn />
            </div>
          </Route>
          <Route path="/sign-up">
            {/* Centered SignUp */}
            <div className="w-full max-w-md p-6 bg-white rounded-md shadow-md">
              <SignUp />
            </div>
          </Route>
          {isSignedIn && <Route path="/admin" component={Admin} />}
          <Route path="/admin/products/new" component={ProductForm} />
          <Route component={NotFound} />
        </Switch>
      </main>

      {!isAuthPage && <Footer />}
    </div>
  );
}


const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function App() {
  if (!clerkPubKey) {
    throw new Error("Missing Clerk Publishable Key in environment variables");
  }

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default App;
