import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/home";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import Admin from "@/pages/admin";
import Orders from "@/pages/orders";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";
import { Button } from "@/components/ui/button";
import { ShoppingCart, LogOut } from "lucide-react";
import { useCart } from "./lib/cart-store";
import { User } from "@shared/schema";
import { apiRequest } from "./lib/queryClient";

function Navigation() {
  const { items } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const [, setLocation] = useLocation();

  const { data: user } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    staleTime: Infinity,
  });

  const handleLogout = async () => {
    await apiRequest('POST', '/api/auth/logout');
    queryClient.setQueryData(['/api/auth/user'], null);
    setLocation('/login');
  };

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link href="/">
            <a className="text-2xl font-bold">Sweet Delights</a>
          </Link>
          {user?.role === 'admin' && (
            <Link href="/admin">
              <Button variant="ghost">Admin</Button>
            </Link>
          )}
          {user && (
            <Link href="/orders">
              <Button variant="ghost">Orders</Button>
            </Link>
          )}
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="flex items-center gap-2">
                <img
                  src={user.picture || undefined}
                  alt={user.displayName}
                  className="w-8 h-8 rounded-full"
                />
                <span>{user.displayName}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button>Login</Button>
            </Link>
          )}
          <Link href="/cart">
            <Button variant="outline" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/admin" component={Admin} />
      <Route path="/orders" component={Orders} />
      <Route path="/login" component={Login} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1">
          <Router />
        </main>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;