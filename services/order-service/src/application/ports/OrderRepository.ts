import type { Order } from "../../domain/entities/Order.js";

export interface OrderRepository {
  save(order: Order): Promise<void>;
  findAll(): Promise<Order[]>;
  findById(orderId: string): Promise<Order | null>;
  update(order: Order): Promise<void>;
}
