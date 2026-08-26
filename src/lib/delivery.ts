import { branches, brand } from "@/data/branches";
import { Branch } from "@/types";

// ---------------------------------------------------------------------------
// Delivery pricing rules
// ---------------------------------------------------------------------------
// 0 – brand.freeDeliveryRadiusKm            → FREE
// freeDeliveryRadiusKm – FLAT_FEE_MAX_KM    → FLAT_FEE_RUPEES
// beyond FLAT_FEE_MAX_KM                    → FLAT_FEE_RUPEES + (km beyond, rounded up) * EXTRA_KM_RATE_RUPEES
// beyond brand.nearestBranchSearchRadiusKm  → not deliverable
//
// The free-delivery radius and the max serviceable radius live on `brand`
// (src/data/branches.ts) so there's a single source of truth shared with
// anything else that reads brand config. Only the flat-fee tier and the
// per-km rate are specific to this pricing model, so those stay here.
const FLAT_FEE_MAX_KM = 5;
const FLAT_FEE_RUPEES = 30;
const EXTRA_KM_RATE_RUPEES = 10; // Change later if client says 15 or 20

const EARTH_RADIUS_KM = 6371;

export interface NearestBranchResult {
  branch: Branch;
  /** Straight-line distance to the nearest branch, in km, rounded to 2 decimals. */
  distance: number;
  /** Delivery fee in ₹. 0 when free or when not deliverable. */
  fee: number;
  /** Whether this address falls within the serviceable radius. */
  deliverable: boolean;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Great-circle (haversine) distance between two lat/lng points, in km.
 * This is straight-line distance, not road distance — a reasonable
 * approximation for branch selection and fee tiers at this scale.
 */
export function getHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return EARTH_RADIUS_KM * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

/**
 * Delivery fee for a given distance, per the tiered pricing rules above.
 * Assumes distance is already rounded — callers should not pass raw
 * floating-point distances, to keep the displayed distance and the
 * charged fee consistent with each other.
 */
export function calculateDeliveryFee(distanceKm: number): number {
  if (distanceKm <= brand.freeDeliveryRadiusKm) {
    return 0;
  }

  if (distanceKm <= FLAT_FEE_MAX_KM) {
    return FLAT_FEE_RUPEES;
  }

  const extraKm = Math.ceil(distanceKm - FLAT_FEE_MAX_KM);
  return FLAT_FEE_RUPEES + extraKm * EXTRA_KM_RATE_RUPEES;
}

/**
 * Finds the nearest branch to a given lat/lng, and returns its distance,
 * the resulting delivery fee, and whether the address is within the
 * serviceable radius at all.
 *
 * By default this searches the static `branches` list from
 * src/data/branches.ts, which is fine for client-side/preview use (the
 * checkout page's live fee display). The authoritative server-side check
 * in POST /api/orders passes `candidateBranches` explicitly (from
 * getBranches(), which reads the `branches` table when DATABASE_URL is
 * set) so that branch edits/deactivations made in /admin/branches are
 * actually reflected in delivery routing and fee calculation — not just
 * in the pickup-branch dropdown.
 *
 * Throws if the branch list is empty, or if the coordinates are not
 * finite — both indicate a configuration/caller bug rather than a normal
 * runtime condition, so callers should validate lat/lng before calling this.
 */
export function findNearestBranch(
  lat: number,
  lng: number,
  candidateBranches: Branch[] = branches
): NearestBranchResult {
  if (candidateBranches.length === 0) {
    throw new Error("findNearestBranch: no branches configured.");
  }

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error(`findNearestBranch: invalid coordinates (${lat}, ${lng}).`);
  }

  let nearestBranch: Branch = candidateBranches[0];
  let shortestDistanceKm = Infinity;

  for (const branch of candidateBranches) {
    const distanceKm = getHaversineDistanceKm(lat, lng, branch.lat, branch.lng);

    // Strictly-less-than means the first branch wins on an exact tie,
    // which keeps branch selection deterministic (stable across calls)
    // rather than depending on array iteration order changing.
    if (distanceKm < shortestDistanceKm) {
      shortestDistanceKm = distanceKm;
      nearestBranch = branch;
    }
  }

  // Round once, then derive both the displayed distance and the charged
  // fee from that same rounded value — otherwise a raw distance of e.g.
  // 5.0001 km can display as "5.00 km" while still being charged the
  // above-5km rate, which looks like a bug to the customer.
  const roundedDistanceKm = Number(shortestDistanceKm.toFixed(2));
  const deliverable = roundedDistanceKm <= brand.nearestBranchSearchRadiusKm;

  return {
    branch: nearestBranch,
    distance: roundedDistanceKm,
    fee: deliverable ? calculateDeliveryFee(roundedDistanceKm) : 0,
    deliverable,
  };
}