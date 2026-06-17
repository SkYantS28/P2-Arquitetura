import type { OrderRepository } from "../../application/ports/OrderRepository.js";
import { Order, type OrderPriority, type OrderStatus } from "../../domain/entities/Order.js";
import { getPostgresPool } from "./postgresClient.js";

type OrderRow = {
  id: string;
  customer_name: string;
  items: string[];
  priority: OrderPriority;
  status: OrderStatus;
  created_at: string;
};

export class PostgresOrderRepository implements OrderRepository {
  private schemaReady = false;

  async save(order: Order): Promise<void> {
    await this.ensureSchema();

    await getPostgresPool().query(
      `
        INSERT INTO orders (id, customer_name, items, priority, status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [order.id, order.customerName, order.items, order.priority, order.status, order.createdAt]
    );
  }

  async findAll(): Promise<Order[]> {
    await this.ensureSchema();

    const result = await getPostgresPool().query<OrderRow>(
      `
        SELECT id, customer_name, items, priority, status, created_at
        FROM orders
        ORDER BY created_at ASC
      `
    );

    return result.rows.map(mapOrderRow);
  }

  async findById(orderId: string): Promise<Order | null> {
    await this.ensureSchema();

    const result = await getPostgresPool().query<OrderRow>(
      `
        SELECT id, customer_name, items, priority, status, created_at
        FROM orders
        WHERE id = $1
      `,
      [orderId]
    );

    return result.rows[0] ? mapOrderRow(result.rows[0]) : null;
  }

  async update(order: Order): Promise<void> {
    await this.ensureSchema();

    await getPostgresPool().query(
      `
        UPDATE orders
        SET customer_name = $2,
            items = $3,
            priority = $4,
            status = $5,
            created_at = $6
        WHERE id = $1
      `,
      [order.id, order.customerName, order.items, order.priority, order.status, order.createdAt]
    );
  }

  private async ensureSchema(): Promise<void> {
    if (this.schemaReady) {
      return;
    }

    await getPostgresPool().query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY,
        customer_name TEXT NOT NULL,
        items TEXT[] NOT NULL,
        priority TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL
      )
    `);

    this.schemaReady = true;
  }
}

function mapOrderRow(row: OrderRow): Order {
  return new Order(
    row.id,
    row.customer_name,
    row.items,
    row.priority,
    row.status,
    new Date(row.created_at).toISOString()
  );
}
