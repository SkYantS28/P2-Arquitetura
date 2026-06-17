import type { Order } from "../../domain/entities/Order.js";

export interface OrderCreatedSubscriber {
  notify(order: Order): Promise<void>;
}
