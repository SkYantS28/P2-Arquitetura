import type { KitchenTicket } from "../../domain/entities/KitchenTicket.js";

export interface KitchenQueueRepository {
  save(ticket: KitchenTicket): Promise<void>;
  findAll(): Promise<KitchenTicket[]>;
}
