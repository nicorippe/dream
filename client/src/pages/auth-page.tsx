import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Redirect } from "wouter";
import { z } from "zod";

// Form schemas
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  discordId: z.string().regex(/^\d{17,19}$/, "Discord ID must be 17-19 digits")
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const { isLoggedIn } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Login form
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      discordId: "",
    },
  });

  const handleLoginSubmit = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Login failed. Please check your credentials.');
      }
      
      toast({
        title: 'Success',
        description: 'Logged in successfully',
      });
      
      window.location.href = '/dashboard';
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: error.message || 'An error occurred during login',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (data: RegisterFormData) => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Registration failed. Please try again.');
      }
      
      toast({
        title: 'Success',
        description: 'Account created successfully',
      });
      
      window.location.href = '/dashboard';
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        variant: 'destructive',
        title: 'Registration failed',
        description: error.message || 'An error occurred during registration',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect if already logged in
  if (isLoggedIn) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <div className="flex min-h-screen">
      {/* Form side */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">Nashi Hub</CardTitle>
            <CardDescription>
              {activeTab === "login" 
                ? "Sign in to your account to continue" 
                : "Create an account to get started"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-username">Username</Label>
                      <Input 
                        id="login-username" 
                        {...loginForm.register("username")} 
                        placeholder="Enter your username"
                      />
                      {loginForm.formState.errors.username && (
                        <p className="text-sm text-destructive">
                          {loginForm.formState.errors.username.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input 
                        id="login-password" 
                        type="password" 
                        {...loginForm.register("password")} 
                        placeholder="Enter your password"
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-sm text-destructive">
                          {loginForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="register" className="space-y-4">
                <form onSubmit={registerForm.handleSubmit(handleRegisterSubmit)}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-username">Username</Label>
                      <Input 
                        id="register-username" 
                        {...registerForm.register("username")} 
                        placeholder="Choose a username"
                      />
                      {registerForm.formState.errors.username && (
                        <p className="text-sm text-destructive">
                          {registerForm.formState.errors.username.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <Input 
                        id="register-password" 
                        type="password" 
                        {...registerForm.register("password")} 
                        placeholder="Choose a password"
                      />
                      {registerForm.formState.errors.password && (
                        <p className="text-sm text-destructive">
                          {registerForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-discord-id">Discord ID</Label>
                      <Input 
                        id="register-discord-id" 
                        {...registerForm.register("discordId")} 
                        placeholder="Your Discord ID (17-19 digits)"
                      />
                      {registerForm.formState.errors.discordId && (
                        <p className="text-sm text-destructive">
                          {registerForm.formState.errors.discordId.message}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Your Discord ID is needed to identify you in the system
                      </p>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground text-center w-full">
              {activeTab === "login" 
                ? "Don't have an account? Switch to register" 
                : "Already have an account? Switch to login"}
            </p>
          </CardFooter>
        </Card>
      </div>
      
      {/* Hero section */}
      <div className="hidden md:block w-1/2 bg-gradient-to-br from-purple-600 to-pink-500 p-12 text-white flex flex-col justify-center">
        <div className="max-w-lg">
          <h1 className="text-4xl font-bold mb-6">Welcome to Nashi Hub</h1>
          <p className="text-xl mb-8">
            Your one-stop platform for Discord user discovery and information.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="rounded-full bg-white/20 p-2 mr-4">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium">Discord Roulette</h3>
                <p className="text-white/80">Discover random Discord users with detailed profiles</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="rounded-full bg-white/20 p-2 mr-4">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium">User Lookup</h3>
                <p className="text-white/80">Find detailed information about any Discord user by ID</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="rounded-full bg-white/20 p-2 mr-4">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium">Friend Finder</h3>
                <p className="text-white/80">Search and find friends across Discord with ease</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}