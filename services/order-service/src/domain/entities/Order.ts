export type OrderStatus = "CREATED" | "PREPARING" | "READY";
export type OrderPriority = "STANDARD" | "FAST_TRACK";

export class Order {
  constructor(
    public readonly id: string,
    public readonly customerName: string,
    public readonly items: string[],
    public readonly priority: OrderPriority,
    public status: OrderStatus,
    public readonly createdAt: string
  ) {}
}
