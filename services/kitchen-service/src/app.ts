import cors from "cors";
import express, { type Request, type Response } from "express";

import { ListKitchenTickets } from "./application/use-cases/ListKitchenTickets.js";
import {
  RegisterKitchenTicket,
  type RegisterKitchenTicketInput
} from "./application/use-cases/RegisterKitchenTicket.js";
import { InMemoryKitchenQueueRepository } from "./infrastructure/persistence/InMemoryKitchenQueueRepository.js";
import { PostgresKitchenQueueRepository } from "./infrastructure/persistence/PostgresKitchenQueueRepository.js";
import type { KitchenQueueRepository } from "./application/ports/KitchenQueueRepository.js";

export function createKitchenApp() {
  const app = express();
  const repository = buildKitchenQueueRepository();
  const registerKitchenTicket = new RegisterKitchenTicket(repository);
  const listKitchenTickets = new ListKitchenTickets(repository);

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_request, response) => {
    response.json({ status: "ok", service: "kitchen-service" });
  });

  app.get("/kitchen/tickets", async (_request, response, next) => {
    try {
      response.json(await listKitchenTickets.execute());
    } catch (error) {
      next(error);
    }
  });

  app.post("/kitchen/tickets", async (request, response, next) => {
    try {
      const ticket = await registerKitchenTicket.execute(parseKitchenTicketRequest(request));
      response.status(201).json(ticket);
    } catch (error) {
      next(error);
    }
  });

  app.use((error: unknown, _request: Request, response: Response, _next: unknown) => {
    const message = error instanceof Error ? error.message : "Unexpected error.";
    response.status(400).json({ message });
  });

  return app;
}

function buildKitchenQueueRepository(): KitchenQueueRepository {
  if (process.env.DATABASE_URL) {
    return new PostgresKitchenQueueRepository();
  }

  return new InMemoryKitchenQueueRepository();
}

function parseKitchenTicketRequest(request: Request): RegisterKitchenTicketInput {
  return {
    orderId: String(request.body.orderId ?? ""),
    customerName: String(request.body.customerName ?? ""),
    items: Array.isArray(request.body.items)
      ? request.body.items.filter((item: unknown): item is string => typeof item === "string")
      : [],
    priority: request.body.priority === "FAST_TRACK" ? "FAST_TRACK" : "STANDARD",
    createdAt: String(request.body.createdAt ?? new Date().toISOString()),
    status: request.body.status === "READY"
      ? "READY"
      : request.body.status === "PREPARING"
        ? "PREPARING"
        : "CREATED"
  };
}
