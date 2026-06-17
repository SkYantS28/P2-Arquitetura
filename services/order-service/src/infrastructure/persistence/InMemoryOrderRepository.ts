import type { Order } from "../../domain/entities/Order.js";
import type { OrderRepository } from "../../application/ports/OrderRepository.js";

export class InMemoryOrderRepository implements OrderRepository {
  private readonly orders: Order[] = [];

  async save(order: Order): Promise<void> {
    this.orders.push(order);
  }

  async findAll(): Promise<Order[]> {
    return [...this.orders];
  }

  async findById(orderId: string): Promise<Order | null> {
    return this.orders.find((order) => order.id === orderId) ?? null;
  }

  async update(order: Order): Promise<void> {
    const index = this.orders.findIndex((storedOrder) => storedOrder.id === order.id);

    if (index >= 0) {
      this.orders[index] = order;
    }
  }
}

