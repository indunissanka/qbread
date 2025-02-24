import { useQuery } from '@tanstack/react-query';
import { Order } from '@shared/schema';
import { format } from 'date-fns';

export default function Orders() {
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      <div className="space-y-4">
        {orders?.map((order) => (
          <div key={order.id} className="border p-6 rounded-lg space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">Order #{order.id}</h3>
                <p className="text-sm text-muted-foreground">
                  {order.customerName} • {order.email} • {order.phone}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">Total: ${Number(order.total).toFixed(2)}</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {order.deliveryMethod}
                </p>
              </div>
            </div>

            {order.deliveryMethod === 'delivery' && (
              <div className="text-sm">
                <p><strong>Delivery Address:</strong> {order.address}</p>
                {order.deliveryTime && (
                  <p><strong>Delivery Time:</strong> {format(new Date(order.deliveryTime), 'PPp')}</p>
                )}
              </div>
            )}

            <div>
              <h4 className="font-medium mb-2">Items</h4>
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.name} × {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
