import { describe, expect, it } from "vitest";

import { AdvanceOrderStatus } from "../../src/application/use-cases/AdvanceOrderStatus.js";
import { CreateOrder } from "../../src/application/use-cases/CreateOrder.js";
import { InMemoryOrderRepository } from "../../src/infrastructure/persistence/InMemoryOrderRepository.js";
import { ItemCountPriorityStrategy } from "../../src/infrastructure/strategies/ItemCountPriorityStrategy.js";

describe("AdvanceOrderStatus", () => {
  it("advances the order lifecycle from created to preparing", async () => {
    const repository = new InMemoryOrderRepository();
    const createOrder = new CreateOrder(repository, new ItemCountPriorityStrategy(), []);
    const advanceOrderStatus = new AdvanceOrderStatus(repository);
    const createdOrder = await createOrder.execute({
      customerName: "Bruno",
      items: ["Sanduiche", "Suco", "Cookie"]
    });

    const updatedOrder = await advanceOrderStatus.execute(createdOrder.id);

    expect(updatedOrder.status).toBe("PREPARING");
  });
});
