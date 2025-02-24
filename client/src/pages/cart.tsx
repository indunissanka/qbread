import { useCart } from '@/lib/cart-store';
import { CartItem } from '@/components/cart-item';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ShoppingBag } from 'lucide-react';

export default function Cart() {
  const { items, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="container mx-auto p-4 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-4">
          Add some delicious items to your cart
        </p>
        <Link href="/">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
      <div className="divide-y">
        {items.map((item) => (
          <CartItem
            key={item.product.id}
            product={item.product}
            quantity={item.quantity}
          />
        ))}
      </div>
      <div className="mt-6 flex flex-col items-end gap-4">
        <div className="text-xl font-semibold">
          Total: ${total().toFixed(2)}
        </div>
        <Link href="/checkout">
          <Button size="lg">Proceed to Checkout</Button>
        </Link>
      </div>
    </div>
  );
}
