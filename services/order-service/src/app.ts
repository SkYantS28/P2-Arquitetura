import cors from "cors";
import express, { type Request, type Response } from "express";

import { AdvanceOrderStatus } from "./application/use-cases/AdvanceOrderStatus.js";
import { CreateOrder } from "./application/use-cases/CreateOrder.js";
import { ListOrders } from "./application/use-cases/ListOrders.js";
import { InMemoryOrderRepository } from "./infrastructure/persistence/InMemoryOrderRepository.js";
import { PostgresOrderRepository } from "./infrastructure/persistence/PostgresOrderRepository.js";
import { ItemCountPriorityStrategy } from "./infrastructure/strategies/ItemCountPriorityStrategy.js";
import { HttpKitchenNotifier } from "./infrastructure/integrations/HttpKitchenNotifier.js";
import type { OrderCreatedSubscriber } from "./application/ports/OrderCreatedSubscriber.js";
import type { OrderRepository } from "./application/ports/OrderRepository.js";

type CreateOrderAppOptions = {
  kitchenServiceUrl?: string;
  subscribers?: OrderCreatedSubscriber[];
};

export function createOrderApp(options: CreateOrderAppOptions = {}) {
  const app = express();
  const orderRepository = buildOrderRepository();
  const subscribers = options.subscribers ?? buildSubscribers(options.kitchenServiceUrl);
  const createOrder = new CreateOrder(
    orderRepository,
    new ItemCountPriorityStrategy(),
    subscribers
  );
  const listOrders = new ListOrders(orderRepository);
  const advanceOrderStatus = new AdvanceOrderStatus(orderRepository);

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_request, response) => {
    response.json({ status: "ok", service: "order-service" });
  });

  app.get("/orders", async (_request, response, next) => {
    try {
      response.json(await listOrders.execute());
    } catch (error) {
      next(error);
    }
  });

  app.post("/orders", async (request, response, next) => {
    try {
      const payload = parseCreateOrderRequest(request);
      const order = await createOrder.execute(payload);
      response.status(201).json(order);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/orders/:orderId/status", async (request, response, next) => {
    try {
      const order = await advanceOrderStatus.execute(request.params.orderId);
      response.json(order);
    } catch (error) {
      next(error);
    }
  });

  app.use((error: unknown, _request: Request, response: Response, _next: unknown) => {
    const message = error instanceof Error ? error.message : "Unexpected error.";
    const statusCode = message === "Order not found." ? 404 : 400;

    response.status(statusCode).json({ message });
  });

  return app;
}

function buildOrderRepository(): OrderRepository {
  if (process.env.DATABASE_URL) {
    return new PostgresOrderRepository();
  }

  return new InMemoryOrderRepository();
}

function parseCreateOrderRequest(request: Request) {
  const customerName = typeof request.body.customerName === "string" ? request.body.customerName : "";
  const items = Array.isArray(request.body.items)
    ? request.body.items.filter((item: unknown): item is string => typeof item === "string")
    : [];

  return { customerName, items };
}

function buildSubscribers(kitchenServiceUrl = process.env.KITCHEN_SERVICE_URL) {
  if (!kitchenServiceUrl) {
    return [];
  }

  return [new HttpKitchenNotifier(kitchenServiceUrl)];
}
