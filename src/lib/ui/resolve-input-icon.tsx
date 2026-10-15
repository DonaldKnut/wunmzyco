import type { LucideIcon } from "lucide-react";
import {
  AtSign,
  Building2,
  Hash,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  MapPinned,
  Package,
  Percent,
  Phone,
  Search,
  Tag,
  Ticket,
  Type,
  User,
  StickyNote,
} from "lucide-react";

const BY_NAME: Record<string, LucideIcon> = {
  email: Mail,
  password: Lock,
  name: User,
  fullname: User,
  fullName: User,
  phone: Phone,
  whatsapp: Phone,
  whatsappnumber: Phone,
  whatsappNumber: Phone,
  street: MapPin,
  landmark: MapPinned,
  city: Building2,
  state: MapPin,
  deliverynotes: StickyNote,
  deliveryNotes: StickyNote,
  note: StickyNote,
  coupon: Ticket,
  couponcode: Ticket,
  couponCode: Ticket,
  q: Search,
  query: Search,
  search: Search,
  token: KeyRound,
  ordernumber: Package,
  orderNumber: Package,
  code: Hash,
  slug: AtSign,
  tagline: Type,
  storename: Type,
  storeName: Type,
  subject: Type,
  message: StickyNote,
  description: StickyNote,
  reason: StickyNote,
  percentoff: Percent,
  percentOff: Percent,
  amountoffnaira: Tag,
  amountOffNaira: Tag,
};

const BY_TYPE: Record<string, LucideIcon> = {
  email: Mail,
  password: Lock,
  search: Search,
  tel: Phone,
  number: Hash,
};

export function resolveInputIcon(opts: {
  icon?: LucideIcon | false | null;
  type?: string;
  name?: string;
  autoComplete?: string;
}): LucideIcon | null {
  if (opts.icon === false || opts.icon === null) return null;
  if (opts.icon) return opts.icon;

  const name = opts.name ?? "";
  if (name && BY_NAME[name]) return BY_NAME[name];

  const lower = name.toLowerCase();
  if (lower.includes("email")) return Mail;
  if (lower.includes("password")) return Lock;
  if (lower.includes("phone") || lower.includes("whatsapp") || lower.includes("tel")) return Phone;
  if (lower.includes("search") || lower === "q") return Search;
  if (lower.includes("name") && !lower.includes("user")) return User;
  if (lower.includes("address") || lower.includes("street")) return MapPin;
  if (lower.includes("city") || lower.includes("state")) return Building2;
  if (lower.includes("coupon") || lower.includes("code")) return Ticket;
  if (lower.includes("token")) return KeyRound;
  if (lower.includes("order")) return Package;
  if (lower.includes("note") || lower.includes("message") || lower.includes("description")) {
    return StickyNote;
  }

  const ac = (opts.autoComplete ?? "").toLowerCase();
  if (ac.includes("email")) return Mail;
  if (ac.includes("password") || ac.includes("current-password") || ac.includes("new-password")) {
    return Lock;
  }
  if (ac.includes("tel") || ac.includes("phone")) return Phone;
  if (ac.includes("name")) return User;
  if (ac.includes("street") || ac.includes("address")) return MapPin;

  const type = (opts.type ?? "text").toLowerCase();
  return BY_TYPE[type] ?? Type;
}
