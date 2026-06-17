import type { OrderCreatedSubscriber } from "../../application/ports/OrderCreatedSubscriber.js";
import type { Order } from "../../domain/entities/Order.js";

export class HttpKitchenNotifier implements OrderCreatedSubscriber {
  constructor(private readonly kitchenServiceUrl: string) {}

  async notify(order: Order): Promise<void> {
    const response = await fetch(`${this.kitchenServiceUrl}/kitchen/tickets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        orderId: order.id,
        customerName: order.customerName,
        items: order.items,
        priority: order.priority,
        status: order.status,
        createdAt: order.createdAt
      })
    });

    if (!response.ok) {
      throw new Error("Kitchen service is unavailable.");
    }
  }
}
