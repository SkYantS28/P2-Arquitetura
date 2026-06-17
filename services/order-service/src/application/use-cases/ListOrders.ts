import type { Order } from "../../domain/entities/Order.js";
import type { OrderRepository } from "../ports/OrderRepository.js";

export class ListOrders {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(): Promise<Order[]> {
    return this.orderRepository.findAll();
  }
}
