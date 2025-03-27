import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  // In futuro, implementeremo lo stato di autenticazione qui
  const isLoggedIn = false;

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="logo-text">Nashi Hub</span>
          </Link>
        </div>
        <nav className="flex items-center gap-4">
          {isLoggedIn ? (
            <Link href="/dashboard">
              <Button>Dashboard</Button>
            </Link>
          ) : (
            <Link href="/dashboard">
              <Button className="btn-gradient">Login con Discord</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}