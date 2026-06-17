import type { KitchenQueueRepository } from "../../application/ports/KitchenQueueRepository.js";
import type { KitchenTicket } from "../../domain/entities/KitchenTicket.js";

export class InMemoryKitchenQueueRepository implements KitchenQueueRepository {
  private readonly tickets: KitchenTicket[] = [];

  async save(ticket: KitchenTicket): Promise<void> {
    this.tickets.push(ticket);
  }

  async findAll(): Promise<KitchenTicket[]> {
    return [...this.tickets].sort((left, right) => {
      if (left.priority === right.priority) {
        return left.createdAt.localeCompare(right.createdAt);
      }

      return left.priority === "FAST_TRACK" ? -1 : 1;
    });
  }
}
