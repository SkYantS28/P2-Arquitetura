import type { OrderPriority } from "../../domain/entities/Order.js";
import type { PriorityStrategy } from "../../application/ports/PriorityStrategy.js";

export class ItemCountPriorityStrategy implements PriorityStrategy {
  calculate(items: string[]): OrderPriority {
    return items.length <= 2 ? "FAST_TRACK" : "STANDARD";
  }
}
