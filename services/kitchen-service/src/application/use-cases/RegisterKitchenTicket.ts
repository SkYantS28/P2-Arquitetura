import { KitchenTicket } from "../../domain/entities/KitchenTicket.js";
import type { KitchenQueueRepository } from "../ports/KitchenQueueRepository.js";

export type RegisterKitchenTicketInput = {
  orderId: string;
  customerName: string;
  items: string[];
  priority: "STANDARD" | "FAST_TRACK";
  createdAt: string;
  status: "CREATED" | "PREPARING" | "READY";
};

export class RegisterKitchenTicket {
  constructor(private readonly kitchenQueueRepository: KitchenQueueRepository) {}

  async execute(input: RegisterKitchenTicketInput): Promise<KitchenTicket> {
    const ticket = new KitchenTicket(
      input.orderId,
      input.customerName,
      input.items,
      input.priority,
      input.createdAt,
      input.status
    );

    await this.kitchenQueueRepository.save(ticket);

    return ticket;
  }
}
