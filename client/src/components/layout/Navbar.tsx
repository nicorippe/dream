import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function Navbar() {
  const { isLoggedIn, isLoading } = useAuth();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="logo-text">Nashi Hub</span>
          </Link>
        </div>
        <nav className="flex items-center gap-4">
          {isLoading ? (
            <div className="w-32 h-10 rounded-md bg-muted animate-pulse"></div>
          ) : isLoggedIn ? (
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button>Dashboard</Button>
              </Link>
              <a href="/api/auth/logout">
                <Button variant="outline">Logout</Button>
              </a>
            </div>
          ) : (
            <a href="/api/auth/discord">
              <Button className="btn-gradient">Login con Discord</Button>
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}