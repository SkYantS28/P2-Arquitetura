import { randomUUID } from "node:crypto";

import { Order, type OrderPriority } from "../entities/Order.js";

type OrderFactoryInput = {
  customerName: string;
  items: string[];
  priority: OrderPriority;
};

export class OrderFactory {
  static create(input: OrderFactoryInput): Order {
    return new Order(
      randomUUID(),
      input.customerName.trim(),
      input.items,
      input.priority,
      "CREATED",
      new Date().toISOString()
    );
  }
}
