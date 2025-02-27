import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import type { Auction } from "@shared/schema";

interface AuctionCardProps {
  auction: Auction;
  socket: WebSocket;
}

export function AuctionCard({ auction, socket }: AuctionCardProps) {
  const [currentPrice, setCurrentPrice] = useState(auction.currentPrice);
  const [bidAmount, setBidAmount] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "bid" && data.data.auctionId === auction.id) {
        setCurrentPrice(data.data.amount);
      }
      if (data.error) {
        toast({
          title: "Bid failed",
          description: data.error,
          variant: "destructive",
        });
      }
    };
  }, [socket, auction.id, toast]);

  const handleBid = () => {
    const amount = parseInt(bidAmount);
    if (isNaN(amount) || amount <= currentPrice) {
      toast({
        title: "Invalid bid",
        description: "Bid must be higher than current price",
        variant: "destructive",
      });
      return;
    }

    socket.send(
      JSON.stringify({
        amount,
        auctionId: auction.id,
      })
    );
    setBidAmount("");
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
          Current Price: ${currentPrice}
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
