import type { Order } from "../../domain/entities/Order.js";
import type { OrderRepository } from "../ports/OrderRepository.js";

const nextStatus: Record<Order["status"], Order["status"]> = {
  CREATED: "PREPARING",
  PREPARING: "READY",
  READY: "READY"
};

export class AdvanceOrderStatus {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new Error("Order not found.");
    }

    order.status = nextStatus[order.status];
    await this.orderRepository.update(order);

    return order;
  }
}
