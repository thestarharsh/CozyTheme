import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Star, StarHalf } from "lucide-react";
import { Label } from "@/components/ui/label";

interface Review {
  id: number;
  userId: string;
  productId: number;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    imageUrl: string;
  };
}

interface ProductReviewsProps {
  productId: number;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { user, isSignedIn } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);

  // Fetch reviews
  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: [`/api/products/${productId}/reviews`],
    queryFn: async () => {
      const response = await fetch(`/api/products/${productId}/reviews`);
      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }
      return response.json();
    },
  });

  // Check if user has purchased the product
  const { data: userOrders = [] } = useQuery({
    queryKey: ["/api/orders"],
    queryFn: async () => {
      const response = await fetch("/api/orders");
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      return response.json();
    },
    enabled: isSignedIn,
  });

  const hasPurchased = userOrders.some(
    (order: any) =>
      order.status === "delivered" &&
      order.orderItems.some((item: any) => item.productId === productId)
  );

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      if (!isSignedIn || !user) {
        throw new Error("Please sign in to submit a review");
      }

      if (!hasPurchased) {
        throw new Error("You can only review products you have purchased and received");
      }

      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ rating, title, comment }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit review");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}/reviews`] });
      setRating(0);
      setTitle("");
      setComment("");
      toast({
        title: "Success",
        description: "Review submitted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitReviewMutation.mutate();
  };

  // Get emoji based on rating
  const getRatingEmoji = (rating: number) => {
    if (rating == 5) return "😍";
    if (rating == 4) return "😊";
    if (rating == 3) return "😐";
    if (rating == 2) return "😕";
    if (rating == 1) return "😢";
    return "";
  };

  // Render stars for display (non-interactive)
  const renderStars = (value: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= value ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 bg-gray-200 animate-pulse rounded" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Customer Reviews</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
          </span>
          {reviews.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium">
                {(
                  reviews.reduce((acc, review) => acc + review.rating, 0) /
                  reviews.length
                ).toFixed(1)}
              </span>
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            </div>
          )}
        </div>
      </div>

      {isSignedIn && hasPurchased && (
        <Card>
          <CardHeader>
            <CardTitle>Write a Review</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Rating</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 transition-colors ${
                            star <= (hoveredRating || rating)
                              ? "fill-current"
                              : ""
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-2xl ml-2">
                    {getRatingEmoji(hoveredRating || rating)}
                  </span>
                </div>
              </div>
              <div>
                <Label htmlFor="comment">Comment</Label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience with this product..."
                  className="mt-2"
                />
              </div>
              <Button
                type="submit"
                disabled={!rating || submitReviewMutation.isPending}
              >
                {submitReviewMutation.isPending ? "Submitting..." : "Submit Review"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {!isSignedIn && (
        <div className="text-center py-4">
          <p className="text-gray-500">
            Please sign in to write a review
          </p>
        </div>
      )}

      {isSignedIn && !hasPurchased && (
        <div className="text-center py-4">
          <p className="text-gray-500">
            You can only review products you have purchased and received
          </p>
        </div>
      )}

      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={review.user.imageUrl}
                    alt={`${review.user.firstName} ${review.user.lastName}`}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium">
                      {review.user.firstName} {review.user.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {renderStars(review.rating)}
              </div>
              {review.title && (
                <h4 className="font-medium mt-4">{review.title}</h4>
              )}
              <p className="text-gray-600 mt-2">{review.comment}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 