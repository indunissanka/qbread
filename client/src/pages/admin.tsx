import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertDeliverySlotSchema, insertProductSchema, type DeliverySlot, type Product } from '@shared/schema';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: slots } = useQuery<DeliverySlot[]>({
    queryKey: ['/api/delivery-slots'],
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const slotForm = useForm({
    resolver: zodResolver(insertDeliverySlotSchema),
    defaultValues: {
      startTime: '',
      endTime: '',
      maxOrders: 10,
      isActive: true,
    }
  });

  const productForm = useForm({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: '',
      description: '',
      price: '',
      image: '',
      category: '',
    }
  });

  const createSlot = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest('POST', '/api/delivery-slots', data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create delivery slot');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Delivery slot created",
        description: "New delivery time slot has been added"
      });
      slotForm.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/delivery-slots'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create delivery slot",
        variant: "destructive"
      });
    }
  });

  const createProduct = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest('POST', '/api/products', data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create product');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Product created",
        description: "New product has been added to the store"
      });
      productForm.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create product",
        variant: "destructive"
      });
    }
  });

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <Tabs defaultValue="products">
        <TabsList className="mb-4">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="delivery">Delivery Times</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Add New Product</h2>
              <Form {...productForm}>
                <form onSubmit={productForm.handleSubmit((data) => createProduct.mutate(data))} className="space-y-4">
                  <FormField
                    control={productForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={productForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={productForm.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={productForm.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={productForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={createProduct.isPending}>
                    {createProduct.isPending ? "Creating..." : "Add Product"}
                  </Button>
                </form>
              </Form>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Existing Products</h2>
              <div className="space-y-4">
                {products?.map((product) => (
                  <div key={product.id} className="border p-4 rounded-lg">
                    <div className="flex gap-4">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div>
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">{product.description}</p>
                        <p className="font-medium">${product.price}</p>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="delivery">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Add New Time Slot</h2>
              <Form {...slotForm}>
                <form onSubmit={slotForm.handleSubmit((data) => createSlot.mutate(data))} className="space-y-4">
                  <FormField
                    control={slotForm.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={slotForm.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={slotForm.control}
                    name="maxOrders"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Orders</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={createSlot.isPending}>
                    {createSlot.isPending ? "Creating..." : "Create Time Slot"}
                  </Button>
                </form>
              </Form>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Existing Time Slots</h2>
              <div className="space-y-4">
                {slots?.map((slot) => (
                  <div key={slot.id} className="border p-4 rounded-lg">
                    <p className="font-semibold">
                      {format(new Date(slot.startTime), 'PPp')} - {format(new Date(slot.endTime), 'p')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Max Orders: {slot.maxOrders}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Status: {slot.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}