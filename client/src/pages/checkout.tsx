import { useCart } from '@/lib/cart-store';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertOrderSchema, DELIVERY_METHODS, type DeliverySlot } from '@shared/schema';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { format } from 'date-fns';

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const orderItems = items.map(item => ({
    productId: item.product.id,
    quantity: item.quantity,
    name: item.product.name,
    price: Number(item.product.price)
  }));

  const { data: deliverySlots } = useQuery<DeliverySlot[]>({
    queryKey: ['/api/delivery-slots'],
    enabled: items.length > 0,
  });

  const form = useForm({
    resolver: zodResolver(insertOrderSchema),
    defaultValues: {
      customerName: '',
      email: '',
      phone: '',
      address: '',
      deliveryMethod: 'pickup',
      deliverySlotId: undefined,
      deliveryTime: undefined,
      items: orderItems,
      total: total().toString()
    }
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest('POST', '/api/orders', data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to place order');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Order placed successfully",
        description: "Thank you for your order!"
      });
      clearCart();
      setLocation('/');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to place order. Please try again.",
        variant: "destructive"
      });
    }
  });

  if (items.length === 0) {
    setLocation('/cart');
    return null;
  }

  const deliveryMethod = form.watch('deliveryMethod');

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => mutate(data))} className="space-y-6">
          <FormField
            control={form.control}
            name="customerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input type="tel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="deliveryMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Delivery Method</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex gap-4"
                  >
                    {DELIVERY_METHODS.map((method) => (
                      <div key={method} className="flex items-center space-x-2">
                        <RadioGroupItem value={method} id={method} />
                        <FormLabel htmlFor={method} className="capitalize">
                          {method}
                        </FormLabel>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {deliveryMethod === 'delivery' && (
            <>
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deliverySlotId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Time</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(parseInt(value));
                        const slot = deliverySlots?.find(s => s.id === parseInt(value));
                        if (slot) {
                          form.setValue('deliveryTime', slot.startTime);
                        }
                      }}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select delivery time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {deliverySlots?.map((slot) => (
                          <SelectItem key={slot.id} value={slot.id.toString()}>
                            {format(new Date(slot.startTime), 'PPp')} - {format(new Date(slot.endTime), 'p')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          <div className="text-xl font-semibold text-right">
            Total: ${total().toFixed(2)}
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Processing..." : "Place Order"}
          </Button>
        </form>
      </Form>
    </div>
  );
}