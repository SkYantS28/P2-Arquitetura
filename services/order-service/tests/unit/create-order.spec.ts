import { describe, expect, it } from "vitest";

import { CreateOrder } from "../../src/application/use-cases/CreateOrder.js";
import { InMemoryOrderRepository } from "../../src/infrastructure/persistence/InMemoryOrderRepository.js";
import { ItemCountPriorityStrategy } from "../../src/infrastructure/strategies/ItemCountPriorityStrategy.js";
import type { Order } from "../../src/domain/entities/Order.js";
import type { OrderCreatedSubscriber } from "../../src/application/ports/OrderCreatedSubscriber.js";

class SubscriberSpy implements OrderCreatedSubscriber {
  public receivedOrder: Order | null = null;

  async notify(order: Order): Promise<void> {
    this.receivedOrder = order;
  }
}

describe("CreateOrder", () => {
  it("creates a fast-track order and notifies subscribers", async () => {
    const repository = new InMemoryOrderRepository();
    const subscriber = new SubscriberSpy();
    const useCase = new CreateOrder(
      repository,
      new ItemCountPriorityStrategy(),
      [subscriber]
    );

    const order = await useCase.execute({
      customerName: "Ana",
      items: ["Cafe", "Pao de queijo"]
    });

    expect(order.priority).toBe("FAST_TRACK");
    expect(subscriber.receivedOrder?.id).toBe(order.id);
    await expect(repository.findAll()).resolves.toHaveLength(1);
  });

  it("rejects orders without items", async () => {
    const useCase = new CreateOrder(
      new InMemoryOrderRepository(),
      new ItemCountPriorityStrategy(),
      []
    );

    await expect(
      useCase.execute({
        customerName: "Ana",
        items: []
      })
    ).rejects.toThrow("At least one item is required.");
  });
});
