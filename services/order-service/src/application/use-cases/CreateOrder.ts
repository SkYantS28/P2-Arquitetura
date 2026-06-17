import { OrderFactory } from "../../domain/factories/OrderFactory.js";
import type { Order } from "../../domain/entities/Order.js";
import type { OrderCreatedSubscriber } from "../ports/OrderCreatedSubscriber.js";
import type { OrderRepository } from "../ports/OrderRepository.js";
import type { PriorityStrategy } from "../ports/PriorityStrategy.js";

type CreateOrderInput = {
  customerName: string;
  items: string[];
};

export class CreateOrder {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly priorityStrategy: PriorityStrategy,
    private readonly subscribers: OrderCreatedSubscriber[]
  ) {}

  async execute(input: CreateOrderInput): Promise<Order> {
    if (!input.customerName.trim()) {
      throw new Error("Customer name is required.");
    }

    if (input.items.length === 0) {
      throw new Error("At least one item is required.");
    }

    const priority = this.priorityStrategy.calculate(input.items);
    const order = OrderFactory.create({
      customerName: input.customerName,
      items: input.items,
      priority
    });

    await this.orderRepository.save(order);

    for (const subscriber of this.subscribers) {
      await subscriber.notify(order);
    }

    return order;
  }
}
