export type TourStep = {
  id: string;
  /** CSS selector — usually `[data-tour="…"]`. Omit for centered welcome card. */
  selector?: string;
  title: string;
  body: string;
  placement?: "top" | "bottom" | "left" | "right" | "center";
  /** Open the mobile nav drawer so sidebar steps are visible on small screens. */
  needsSidebar?: boolean;
};

export const TOUR_STORAGE_KEY = "wunmzy-admin-tour-v1";

export const ADMIN_TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to Wunmzy Admin",
    body: "A quick walkthrough of your dashboard — catalogue, orders, homepage, and store ops. Takes about a minute.",
    placement: "center",
  },
  {
    id: "sidebar",
    selector: '[data-tour="sidebar"]',
    title: "Navigation",
    body: "Jump between every staff tool from this sidebar. On phones, open the menu (☰) anytime — we’ll open it for you during this tour.",
    placement: "right",
    needsSidebar: true,
  },
  {
    id: "overview",
    selector: '[data-tour="nav-overview"]',
    title: "Overview",
    body: "Your home base — live sales, order counts, low-stock alerts, and recent orders at a glance.",
    placement: "right",
    needsSidebar: true,
  },
  {
    id: "metrics",
    selector: '[data-tour="metrics"]',
    title: "Live metrics",
    body: "These cards pull from your database. Empty stores still render cleanly — numbers update as you sell.",
    placement: "bottom",
  },
  {
    id: "products",
    selector: '[data-tour="nav-products"]',
    title: "Products",
    body: "Add, edit, publish, and archive catalogue items. Upload photos (Cloudinary), set status to Published to go live.",
    placement: "right",
    needsSidebar: true,
  },
  {
    id: "homepage",
    selector: '[data-tour="nav-homepage"]',
    title: "Homepage",
    body: "Edit hero copy, the announcement bar, and carousel slides — including uploaded images that appear on the storefront.",
    placement: "right",
    needsSidebar: true,
  },
  {
    id: "orders",
    selector: '[data-tour="nav-orders"]',
    title: "Orders",
    body: "Paystack and WhatsApp orders land here. Open any order to update status, leave notes, or review payment.",
    placement: "right",
    needsSidebar: true,
  },
  {
    id: "settings",
    selector: '[data-tour="nav-settings"]',
    title: "Settings",
    body: "Store name, policies, contact details, and operational defaults. Homepage visuals live under Homepage.",
    placement: "right",
    needsSidebar: true,
  },
  {
    id: "account",
    selector: '[data-tour="account"]',
    title: "Your account",
    body: "See who you’re signed in as and sign out securely when you’re done. Restart this tour anytime from Take a tour.",
    placement: "right",
    needsSidebar: true,
  },
];
