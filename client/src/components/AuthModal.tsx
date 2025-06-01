import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Smartphone, Mail, Phone } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePhoneAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;

    setIsLoading(true);
    // Redirect to Replit Auth
    window.location.href = "/api/login";
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
          </div>
          <DialogTitle className="text-center">
            Welcome to CozyGripz
          </DialogTitle>
          <p className="text-center text-neutral-600 text-sm">
            Sign in to access your cart and orders
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Primary Sign In Button */}
          <Button 
            className="w-full" 
            size="lg"
            onClick={() => window.location.href = "/api/login"}
          >
            Sign In with Replit
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with phone
              </span>
            </div>
          </div>

          {/* Phone Number Form */}
          <form onSubmit={handlePhoneAuth} className="space-y-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex mt-2">
                <div className="bg-neutral-100 px-3 py-2 border border-r-0 border-neutral-200 rounded-l-lg text-neutral-600 flex items-center">
                  <Phone className="w-4 h-4 mr-1" />
                  +91
                </div>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your mobile number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="rounded-l-none"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !phoneNumber.trim()}
            >
              {isLoading ? "Sending OTP..." : "Send OTP"}
            </Button>
          </form>

          <div className="text-center text-xs text-neutral-500">
            By continuing, you agree to our{" "}
            <a href="#" className="text-primary hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
