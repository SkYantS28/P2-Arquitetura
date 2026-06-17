import { describe, expect, it } from "vitest";

import { RegisterKitchenTicket } from "../../src/application/use-cases/RegisterKitchenTicket.js";
import { ListKitchenTickets } from "../../src/application/use-cases/ListKitchenTickets.js";
import { InMemoryKitchenQueueRepository } from "../../src/infrastructure/persistence/InMemoryKitchenQueueRepository.js";

describe("ListKitchenTickets", () => {
  it("prioritizes fast-track tickets in the kitchen queue", async () => {
    const repository = new InMemoryKitchenQueueRepository();
    const registerKitchenTicket = new RegisterKitchenTicket(repository);
    const listKitchenTickets = new ListKitchenTickets(repository);

    await registerKitchenTicket.execute({
      orderId: "1",
      customerName: "Lia",
      items: ["Prato executivo"],
      priority: "STANDARD",
      createdAt: "2026-06-17T12:00:00.000Z",
      status: "CREATED"
    });

    await registerKitchenTicket.execute({
      orderId: "2",
      customerName: "Paulo",
      items: ["Cafe"],
      priority: "FAST_TRACK",
      createdAt: "2026-06-17T12:01:00.000Z",
      status: "CREATED"
    });

    const tickets = await listKitchenTickets.execute();

    expect(tickets[0]?.orderId).toBe("2");
  });
});
