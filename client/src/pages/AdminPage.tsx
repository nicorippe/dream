import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";
import AdminDashboard from "@/components/AdminDashboard";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const { isLoggedIn, isLoading, user } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminLoading, setAdminLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if the user is an admin
    if (isLoggedIn && !isLoading) {
      // Fetch the user data to check admin status
      fetch('/api/user')
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch user data');
          return res.json();
        })
        .then(userData => {
          if (userData && userData.isAdmin) {
            setIsAdmin(true);
          } else {
            toast({
              title: "Access Denied",
              description: "You don't have admin permissions to access this page.",
              variant: "destructive"
            });
          }
          setAdminLoading(false);
        })
        .catch(error => {
          console.error('Error checking admin status:', error);
          setAdminLoading(false);
        });
    } else if (!isLoading) {
      setAdminLoading(false);
    }
  }, [isLoggedIn, isLoading, toast]);

  // Show loading state
  if (isLoading || adminLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect if not logged in
  if (!isLoggedIn) {
    return <Redirect to="/auth" />;
  }

  // Redirect if not an admin
  if (!isAdmin) {
    return <Redirect to="/dashboard" />;
  }

  // Render admin dashboard
  return <AdminDashboard />;
}