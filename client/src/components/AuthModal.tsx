import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SignIn } from "@clerk/clerk-react";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AuthModal({ open, onClose }: AuthModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Welcome to CozyGripz</DialogTitle>
          <p className="text-center text-neutral-600 text-sm">
            Sign in to access your cart and orders
          </p>
        </DialogHeader>

        <SignIn path="/sign-in" />
      </DialogContent>
    </Dialog>
  );
}
