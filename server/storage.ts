import { Product, InsertProduct, Order, InsertOrder, DeliverySlot, InsertDeliverySlot, User, InsertUser } from "@shared/schema";
import { products, orders, deliverySlots, users } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  createOrder(order: InsertOrder): Promise<Order>;
  getOrders(): Promise<Order[]>;
  getDeliverySlots(): Promise<DeliverySlot[]>;
  createDeliverySlot(slot: InsertDeliverySlot): Promise<DeliverySlot>;
  updateDeliverySlot(id: number, slot: Partial<InsertDeliverySlot>): Promise<DeliverySlot>;
  getAvailableDeliverySlots(date: Date): Promise<DeliverySlot[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByLineId(lineId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    // Ensure the order data is properly formatted
    const orderData = {
      customerName: order.customerName,
      email: order.email,
      phone: order.phone,
      address: order.address || '',
      deliveryMethod: order.deliveryMethod,
      deliverySlotId: order.deliverySlotId,
      deliveryTime: order.deliveryTime,
      items: order.items,
      total: order.total.toString(), // Convert to string for decimal column
    };

    const [newOrder] = await db.insert(orders).values(orderData).returning();
    return newOrder;
  }

  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders);
  }

  async getDeliverySlots(): Promise<DeliverySlot[]> {
    return await db.select().from(deliverySlots);
  }

  async createDeliverySlot(slot: InsertDeliverySlot): Promise<DeliverySlot> {
    const [newSlot] = await db.insert(deliverySlots).values(slot).returning();
    return newSlot;
  }

  async updateDeliverySlot(id: number, slot: Partial<InsertDeliverySlot>): Promise<DeliverySlot> {
    const [updatedSlot] = await db
      .update(deliverySlots)
      .set(slot)
      .where(eq(deliverySlots.id, id))
      .returning();
    return updatedSlot;
  }

  async getAvailableDeliverySlots(date: Date): Promise<DeliverySlot[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await db
      .select()
      .from(deliverySlots)
      .where(
        and(
          eq(deliverySlots.isActive, true),
          gte(deliverySlots.startTime, startOfDay),
          lte(deliverySlots.endTime, endOfDay)
        )
      );
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByLineId(lineId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.lineId, lineId));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }
}

export const storage = new DatabaseStorage();

// Create some initial products
async function initializeProducts() {
  const initialProducts = [
    {
      name: "Classic Croissant",
      description: "Buttery, flaky French pastry",
      price: "3.50",
      image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a",
      category: "Pastries"
    },
    {
      name: "Sourdough Bread",
      description: "Traditional artisan bread",
      price: "6.00",
      image: "https://images.unsplash.com/photo-1504469288085-feb62ad2903d",
      category: "Breads"
    },
    {
      name: "Chocolate Cake",
      description: "Rich chocolate layer cake",
      price: "28.00",
      image: "https://images.unsplash.com/photo-1587241321921-91a834d6d191",
      category: "Cakes"
    }
  ];

  const existingProducts = await db.select().from(products);
  if (existingProducts.length === 0) {
    await db.insert(products).values(initialProducts);
  }
}

// Initialize products when the application starts
initializeProducts().catch(console.error);