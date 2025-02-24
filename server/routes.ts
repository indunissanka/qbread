import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import passport from 'passport';
import { insertOrderSchema, insertDeliverySlotSchema, insertProductSchema } from "@shared/schema";
import { z } from "zod";
import { isAuthenticated, isAdmin } from './auth';

export async function registerRoutes(app: Express) {
  // Authentication routes
  app.get('/api/auth/line', passport.authenticate('line'));

  app.get('/api/auth/line/callback',
    passport.authenticate('line', {
      successRedirect: '/',
      failureRedirect: '/login'
    })
  );

  app.get('/api/auth/user', (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: 'Not authenticated' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.logout(() => {
      res.json({ message: 'Logged out successfully' });
    });
  });

  // Public routes
  app.get("/api/products", async (_req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  // Admin routes
  app.post("/api/products", isAdmin, async (req, res) => {
    try {
      const product = insertProductSchema.parse(req.body);
      const newProduct = await storage.createProduct(product);
      res.status(201).json(newProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data" });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.get("/api/delivery-slots", async (req, res) => {
    const date = req.query.date ? new Date(req.query.date as string) : new Date();
    const slots = await storage.getAvailableDeliverySlots(date);
    res.json(slots);
  });

  app.post("/api/delivery-slots", isAdmin, async (req, res) => {
    try {
      const slot = insertDeliverySlotSchema.parse(req.body);
      const newSlot = await storage.createDeliverySlot(slot);
      res.status(201).json(newSlot);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid delivery slot data" });
      }
      res.status(500).json({ message: "Failed to create delivery slot" });
    }
  });

  app.post("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const order = insertOrderSchema.parse(req.body);
      const newOrder = await storage.createOrder(order);
      res.status(201).json(newOrder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data" });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.get("/api/orders", isAuthenticated, async (_req, res) => {
    const orders = await storage.getOrders();
    res.json(orders);
  });

  const httpServer = createServer(app);
  return httpServer;
}