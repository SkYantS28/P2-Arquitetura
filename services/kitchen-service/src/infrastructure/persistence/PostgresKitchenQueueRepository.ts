import type { KitchenQueueRepository } from "../../application/ports/KitchenQueueRepository.js";
import {
  KitchenTicket,
  type KitchenTicketPriority,
  type KitchenTicketStatus
} from "../../domain/entities/KitchenTicket.js";
import { getPostgresPool } from "./postgresClient.js";

type KitchenTicketRow = {
  order_id: string;
  customer_name: string;
  items: string[];
  priority: KitchenTicketPriority;
  status: KitchenTicketStatus;
  created_at: string;
};

export class PostgresKitchenQueueRepository implements KitchenQueueRepository {
  private schemaReady = false;

  async save(ticket: KitchenTicket): Promise<void> {
    await this.ensureSchema();

    await getPostgresPool().query(
      `
        INSERT INTO kitchen_tickets (order_id, customer_name, items, priority, status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (order_id) DO UPDATE
        SET customer_name = EXCLUDED.customer_name,
            items = EXCLUDED.items,
            priority = EXCLUDED.priority,
            status = EXCLUDED.status,
            created_at = EXCLUDED.created_at
      `,
      [ticket.orderId, ticket.customerName, ticket.items, ticket.priority, ticket.status, ticket.createdAt]
    );
  }

  async findAll(): Promise<KitchenTicket[]> {
    await this.ensureSchema();

    const result = await getPostgresPool().query<KitchenTicketRow>(
      `
        SELECT order_id, customer_name, items, priority, status, created_at
        FROM kitchen_tickets
        ORDER BY CASE WHEN priority = 'FAST_TRACK' THEN 0 ELSE 1 END, created_at ASC
      `
    );

    return result.rows.map(mapKitchenTicketRow);
  }

  private async ensureSchema(): Promise<void> {
    if (this.schemaReady) {
      return;
    }

    await getPostgresPool().query(`
      CREATE TABLE IF NOT EXISTS kitchen_tickets (
        order_id UUID PRIMARY KEY,
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

function mapKitchenTicketRow(row: KitchenTicketRow): KitchenTicket {
  return new KitchenTicket(
    row.order_id,
    row.customer_name,
    row.items,
    row.priority,
    new Date(row.created_at).toISOString(),
    row.status
  );
}
