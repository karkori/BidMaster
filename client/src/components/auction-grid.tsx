import { useQuery } from "@tanstack/react-query";
import { AuctionCard } from "./auction-card";
import type { Auction } from "@shared/schema";
import { useEffect, useState } from "react";

export function AuctionGrid() {
  const [socket, setSocket] = useState<WebSocket>();
  
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    setSocket(ws);
    return () => ws.close();
  }, []);

  const { data: auctions, isLoading } = useQuery<Auction[]>({
    queryKey: ["/api/auctions"],
  });

  if (isLoading || !socket) {
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
          socket={socket}
        />
      ))}
    </div>
  );
}
