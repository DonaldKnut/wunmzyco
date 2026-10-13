import { getSessionUser } from "@/lib/auth/session";
import { getCustomerOrders } from "@/lib/store/account";
import { formatNgn } from "@/lib/currency";
import { EmptyState } from "@/components/storefront/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata = { title: "Orders" };

export default async function AccountOrdersPage() {
  const user = await getSessionUser();
  if (!user) return null;
  const orders = await getCustomerOrders(user.id);

  return (
    <div>
      <h2 className="font-display mb-6 text-2xl">Orders</h2>
      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Your order history will show here after your first purchase."
          actionHref="/shop"
          actionLabel="Browse shop"
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.orderNumber}</TableCell>
                <TableCell>{order.createdAt.toLocaleDateString("en-NG")}</TableCell>
                <TableCell>{order.status.replace(/_/g, " ")}</TableCell>
                <TableCell className="text-right">{formatNgn(order.totalKobo)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
