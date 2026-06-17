import type { KitchenTicket } from "../../domain/entities/KitchenTicket.js";
import type { KitchenQueueRepository } from "../ports/KitchenQueueRepository.js";

export class ListKitchenTickets {
  constructor(private readonly kitchenQueueRepository: KitchenQueueRepository) {}

  async execute(): Promise<KitchenTicket[]> {
    return this.kitchenQueueRepository.findAll();
  }
}
