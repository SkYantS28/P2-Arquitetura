import type { OrderPriority } from "../../domain/entities/Order.js";

export interface PriorityStrategy {
  calculate(items: string[]): OrderPriority;
}
