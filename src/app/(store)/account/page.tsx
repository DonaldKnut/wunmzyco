import Link from "next/link";
import { getSessionUser } from "@/lib/auth/session";
import { getCustomerOrders } from "@/lib/store/account";
import { formatNgn } from "@/lib/currency";
import { EmptyState } from "@/components/storefront/empty-state";

export const metadata = { title: "Account" };

export default async function AccountOverviewPage() {
  const user = await getSessionUser();
  if (!user) return null;
  const orders = await getCustomerOrders(user.id);
  const recent = orders.slice(0, 3);

  return (
    <div className="space-y-10">
      <section className="grid gap-6 sm:grid-cols-2">
        <div className="border border-border bg-card p-6">
          <h2 className="font-display mb-2 text-xl">Profile</h2>
          <p className="text-sm">{user.name}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div className="border border-border bg-card p-6">
          <h2 className="font-display mb-2 text-xl">Quick links</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/account/orders" className="underline-offset-4 hover:underline">
                View orders
              </Link>
            </li>
            <li>
              <Link href="/account/addresses" className="underline-offset-4 hover:underline">
                Saved addresses
              </Link>
            </li>
            <li>
              <Link href="/track-order" className="underline-offset-4 hover:underline">
                Track an order
              </Link>
            </li>
          </ul>
        </div>
      </section>
      <section>
        <h2 className="font-display mb-4 text-2xl">Recent orders</h2>
        {recent.length === 0 ? (
          <EmptyState
            title="No orders yet"
            description="When you place an order while signed in, it will appear here."
            actionHref="/shop"
            actionLabel="Shop now"
          />
        ) : (
          <ul className="divide-y divide-border border border-border">
            {recent.map((order) => (
              <li key={order.id} className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm">
                <div>
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-muted-foreground">
                    {order.status.replace(/_/g, " ")} · {order.createdAt.toLocaleDateString("en-NG")}
                  </p>
                </div>
                <p className="font-medium">{formatNgn(order.totalKobo)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
