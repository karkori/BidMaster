import { Navigation } from "@/components/navigation";
import { AuctionGrid } from "@/components/auction-grid";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Active Auctions</h1>
        <AuctionGrid />
      </main>
    </div>
  );
}
