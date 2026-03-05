/**
 * Mappers: API DTO → UI model.
 *
 * Keeps the service layer clean and the components decoupled
 * from the backend contract.
 */

import type {
  UserResponseDTO,
  AddressResponseDTO,
  UserProfile,
  SavedAddress,
} from "@/models/profile";

// ── helpers ──────────────────────────────────────────────

/** "2023-01-15T10:30:00Z" → "Jan 2023" */
function formatJoinedDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  } catch {
    return "Member";
  }
}

/**
 * Derive membership tier from roles array.
 * Adjust this logic to match your backend's role naming.
 */
function deriveMembershipTier(
  roles: string[]
): "Bronze" | "Silver" | "Gold" | "Platinum" {
  const r = roles.map((s) => s.toUpperCase());
  if (r.includes("PLATINUM") || r.includes("ROLE_PLATINUM")) return "Platinum";
  if (r.includes("GOLD") || r.includes("ROLE_GOLD")) return "Gold";
  if (r.includes("SILVER") || r.includes("ROLE_SILVER")) return "Silver";
  return "Bronze";
}

/** Capitalize first letter, lowercase rest: "HOME" → "Home" */
function capitalizeType(type: string): string {
  if (!type) return "Other";
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
}

// ── mappers ──────────────────────────────────────────────

export function mapUserResponseToProfile(dto: UserResponseDTO): UserProfile {
  return {
    id: dto.id,
    name: dto.displayName,
    email: dto.email,
    phone: dto.phone ?? undefined,
    roles: dto.roles,
    active: dto.active,
    // Avatar URLs – backend doesn't provide these yet.
    // When you add avatar support to your User entity, map them here.
    avatarUrl: undefined,
    sidebarAvatarUrl: undefined,
    navbarAvatarUrl: undefined,
    membershipTier: deriveMembershipTier(dto.roles),
    joinedDate: formatJoinedDate(dto.createdAt),
  };
}

export function mapAddressResponseToSaved(
  dto: AddressResponseDTO,
  isPrimary: boolean
): SavedAddress {
  return {
    id: dto.id,
    userId: dto.userId,
    line1: dto.line1,
    line2: dto.line2 ?? undefined,
    city: dto.city,
    state: dto.state ?? undefined,
    postalCode: dto.postalCode,
    country: dto.country,
    type: capitalizeType(dto.type),
    isPrimary,
  };
}

/**
 * Map a list of AddressResponseDTO[].
 * The first address with type "HOME" is treated as primary;
 * if none, the first address in the list is primary.
 */
export function mapAddressListToSaved(
  dtos: AddressResponseDTO[]
): SavedAddress[] {
  if (dtos.length === 0) return [];

  const homeIndex = dtos.findIndex(
    (d) => d.type.toUpperCase() === "HOME"
  );
  const primaryIndex = homeIndex >= 0 ? homeIndex : 0;

  return dtos.map((dto, i) =>
    mapAddressResponseToSaved(dto, i === primaryIndex)
  );
}