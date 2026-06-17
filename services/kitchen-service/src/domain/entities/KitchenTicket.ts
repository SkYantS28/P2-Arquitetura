export type KitchenTicketStatus = "CREATED" | "PREPARING" | "READY";
export type KitchenTicketPriority = "STANDARD" | "FAST_TRACK";

export class KitchenTicket {
  constructor(
    public readonly orderId: string,
    public readonly customerName: string,
    public readonly items: string[],
    public readonly priority: KitchenTicketPriority,
    public readonly createdAt: string,
    public readonly status: KitchenTicketStatus
  ) {}
}
