import { getSessionUser } from "@/lib/auth/session";
import { getCustomerAddresses } from "@/lib/store/account";
import { EmptyState } from "@/components/storefront/empty-state";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Addresses" };

export default async function AccountAddressesPage() {
  const user = await getSessionUser();
  if (!user) return null;
  const addresses = await getCustomerAddresses(user.id);

  return (
    <div>
      <h2 className="font-display mb-6 text-2xl">Saved addresses</h2>
      {addresses.length === 0 ? (
        <EmptyState
          title="No saved addresses"
          description="Addresses you save at checkout will appear here for faster future orders."
          actionHref="/checkout"
          actionLabel="Go to checkout"
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <li key={addr.id} className="border border-border bg-card p-5 text-sm">
              <div className="mb-2 flex items-center gap-2">
                <p className="font-medium">{addr.fullName}</p>
                {addr.isDefault ? <Badge variant="secondary">Default</Badge> : null}
              </div>
              <p>{addr.street}</p>
              {addr.landmark ? <p className="text-muted-foreground">{addr.landmark}</p> : null}
              <p>
                {addr.city}, {addr.state}
              </p>
              <p className="text-muted-foreground">{addr.phone}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
