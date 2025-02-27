import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { Auction } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface AuctionCardProps {
  auction: Auction;
}

export function AuctionCard({ auction }: AuctionCardProps) {
  const [bidAmount, setBidAmount] = useState("");
  const { toast } = useToast();

  const handleBid = async () => {
    const amount = parseInt(bidAmount);
    if (isNaN(amount) || amount <= auction.currentPrice) {
      toast({
        title: "Invalid bid",
        description: "Bid must be higher than current price",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest("POST", `/api/auctions/${auction.id}/bid`, { amount });
      setBidAmount("");
    } catch (error: any) {
      toast({
        title: "Bid failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <img
          src={auction.imageUrl}
          alt={auction.title}
          className="w-full h-48 object-cover rounded-md mb-4"
        />
        <h3 className="text-lg font-semibold mb-2">{auction.title}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {auction.description}
        </p>
        <div className="text-xl font-bold mb-2">
          Current Price: ${auction.currentPrice}
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Input
          type="number"
          value={bidAmount}
          onChange={(e) => setBidAmount(e.target.value)}
          placeholder="Enter bid amount"
          className="flex-1"
        />
        <Button onClick={handleBid}>Place Bid</Button>
      </CardFooter>
    </Card>
  );
}