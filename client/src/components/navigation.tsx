import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Plus, LogOut } from "lucide-react";

export function Navigation() {
  const { user, logoutMutation } = useAuth();

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <a className="text-2xl font-bold">Auctions</a>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link href="/create">
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Auction
            </Button>
          </Link>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {user?.username}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logoutMutation.mutate()}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
