// ─── Driver ────────────────────────────────────────────────────────────────
export interface Driver {
  driver_id: number;
  name: string;
  phone: string;
  active: boolean;
}

export interface DriverDTO {
  name: string;
  phone: string;
  active: boolean;
}


// ─── UI Helpers ────────────────────────────────────────────────────────────
export interface StatCard {
  label: string;
  value: number | string;
  sub: string;
  color: "orange" | "green" | "blue" | "yellow";
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  section: string;
}
