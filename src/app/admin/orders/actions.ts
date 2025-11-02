'use server';

import { getDb } from '@/db';
import type { Order } from '@/lib/types';
import { desc, eq } from 'drizzle-orm';
import { orders, users, plans } from '@/db/schema';

export async function getOrders(): Promise<Order[]> {
  const db = getDb();
  // Use Drizzle's relational queries which leverages the relations defined in the schema.
  const results = await db.query.orders.findMany({
    with: {
      user: {
        columns: {
          name: true,
          email: true,
        },
      },
      plan: {
        columns: {
          name: true,
        },
      },
    },
    orderBy: [desc(orders.date)],
  });

  return results.map((row) => ({
    id: row.id,
    user_name: row.user?.name || 'N/A',
    user_email: row.user?.email || 'N/A',
    plan_name: row.plan?.name || 'N/A',
    amount: row.amount,
    date: new Date(row.date).toISOString().split('T')[0],
    status: row.status,
  }));
}
