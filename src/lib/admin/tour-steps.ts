export type TourStep = {
  id: string;
  /** CSS selector — usually `[data-tour="…"]`. Omit for centered welcome card. */
  selector?: string;
  title: string;
  body: string;
  placement?: "top" | "bottom" | "left" | "right" | "center";
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
    selector: 'aside[data-tour="sidebar"]',
    title: "Navigation",
    body: "Jump between every staff tool from this sidebar. Collapse it anytime to free up space on smaller screens.",
    placement: "right",
  },
  {
    id: "overview",
    selector: 'aside[data-tour="sidebar"] [data-tour="nav-overview"]',
    title: "Overview",
    body: "Your home base — live sales, order counts, low-stock alerts, and recent orders at a glance.",
    placement: "right",
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
    selector: 'aside[data-tour="sidebar"] [data-tour="nav-products"]',
    title: "Products",
    body: "Add, edit, publish, and archive catalogue items. New products open in a modal — set status to Published to go live.",
    placement: "right",
  },
  {
    id: "homepage",
    selector: 'aside[data-tour="sidebar"] [data-tour="nav-homepage"]',
    title: "Homepage",
    body: "Edit hero copy, the announcement bar, and carousel slides — including uploaded images that appear on the storefront.",
    placement: "right",
  },
  {
    id: "orders",
    selector: 'aside[data-tour="sidebar"] [data-tour="nav-orders"]',
    title: "Orders",
    body: "Fulfilment queue and history. Open any order to update status, leave support notes, or review payment details.",
    placement: "right",
  },
  {
    id: "settings",
    selector: 'aside[data-tour="sidebar"] [data-tour="nav-settings"]',
    title: "Settings",
    body: "Store name, policies, contact details, and operational defaults. Homepage visuals live under Homepage.",
    placement: "right",
  },
  {
    id: "account",
    selector: 'aside[data-tour="sidebar"] [data-tour="account"]',
    title: "Your account",
    body: "See who you’re signed in as and sign out securely when you’re done. Restart this tour anytime from the header.",
    placement: "right",
  },
];
