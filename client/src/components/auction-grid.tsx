import { useQuery } from "@tanstack/react-query";
import { AuctionCard } from "./auction-card";
import type { Auction } from "@shared/schema";
import { useEffect, useState } from "react";

export function AuctionGrid() {
  const [auctions, setAuctions] = useState<Auction[]>([]);

  const { data: initialAuctions, isLoading } = useQuery<Auction[]>({
    queryKey: ["/api/auctions"],
  });

  useEffect(() => {
    if (initialAuctions) {
      setAuctions(initialAuctions);
    }
  }, [initialAuctions]);

  useEffect(() => {
    const eventSource = new EventSource("/api/auctions/events");

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "initial":
          setAuctions(data.data);
          break;
        case "new_auction":
          setAuctions(prev => [...prev, data.data]);
          break;
        case "new_bid":
          setAuctions(prev => prev.map(auction => 
            auction.id === data.data.auctionId
              ? { ...auction, currentPrice: data.data.currentPrice }
              : auction
          ));
          break;
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-96 bg-muted rounded-lg"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {auctions?.map((auction) => (
        <AuctionCard
          key={auction.id}
          auction={auction}
        />
      ))}
    </div>
  );
}