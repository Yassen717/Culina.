import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

// Minimal mock types used for the posts endpoint. These are intentionally
// local to the server to avoid coupling server code to client-only modules.
type Post = {
  id: string;
  userId: string;
  image: string;
  caption: string;
  location?: string;
  likes: number;
  comments: number;
  isRecipe: boolean;
  recipeId?: string;
  createdAt: string;
  tags: string[];
};

// A very small mock dataset so the API is immediately usable.
const MOCK_POSTS: Post[] = [
  {
    id: "post-health-1",
    userId: "user1",
    image: "/assets/sample-1.png",
    caption: "Welcome to FeastFlow API — mock post",
    location: "Internet",
    likes: 10,
    comments: 2,
    isRecipe: false,
    createdAt: "just now",
    tags: ["mock", "hello"],
  },
];

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check for readiness/liveness probes
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      time: new Date().toISOString(),
      env: process.env.NODE_ENV || "development",
    });
  });

  // Example: minimal users read by id via in-memory storage
  app.get("/api/users/:id", async (req, res, next) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (err) {
      next(err);
    }
  });

  // Minimal posts endpoint using local mock data
  app.get("/api/posts", (_req, res) => {
    res.json(MOCK_POSTS);
  });

  const httpServer = createServer(app);

  return httpServer;
}
