import { pgTable, text, serial, decimal, json, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  lineId: text("line_id").unique(),
  displayName: text("display_name").notNull(),
  email: text("email"),
  picture: text("picture"),
  role: text("role").notNull().default('user'),
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  image: text("image").notNull(),
  category: text("category").notNull(),
});

export const deliverySlots = pgTable("delivery_slots", {
  id: serial("id").primaryKey(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  maxOrders: integer("max_orders").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  customerName: text("customer_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address"),
  deliveryMethod: text("delivery_method").notNull(),
  deliverySlotId: integer("delivery_slot_id").references(() => deliverySlots.id),
  deliveryTime: timestamp("delivery_time"),
  items: json("items").$type<Array<{
    productId: number;
    quantity: number;
    name: string;
    price: number;
  }>>().notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProductSchema = createInsertSchema(products);
export const insertOrderSchema = createInsertSchema(orders);
export const insertDeliverySlotSchema = createInsertSchema(deliverySlots);
export const insertUserSchema = createInsertSchema(users);

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type DeliverySlot = typeof deliverySlots.$inferSelect;
export type InsertDeliverySlot = z.infer<typeof insertDeliverySlotSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export const DELIVERY_METHODS = ['pickup', 'delivery'] as const;