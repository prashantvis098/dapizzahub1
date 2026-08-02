import { Branch } from "@/types";
import { branches, brand } from "@/data/branches";

/**
 * Haversine formula — distance between two lat/lng points in kilometers.
 * Standard, accurate for this use case (city-scale distances).
 */
export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface BranchWithDistance extends Branch {
  distanceKm: number;
  withinRadius: boolean;
}

export function rankBranchesByDistance(userLat: number, userLng: number): BranchWithDistance[] {
  return branches
    .map((b) => {
      const d = distanceKm(userLat, userLng, b.lat, b.lng);
      return { ...b, distanceKm: d, withinRadius: d <= brand.nearestBranchSearchRadiusKm };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

export type GeolocationState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; lat: number; lng: number }
  | { status: "denied" }
  | { status: "unsupported" }
  | { status: "error"; message: string };

/**
 * Requests the browser's geolocation once. Wrapped in a Promise so callers
 * can await it directly. Never throws — always resolves to a GeolocationState
 * so the UI can render every outcome (denied, unsupported, error) gracefully.
 */
export function requestUserLocation(): Promise<GeolocationState> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      resolve({ status: "unsupported" });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          status: "success",
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          resolve({ status: "denied" });
        } else {
          resolve({ status: "error", message: error.message });
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 }
    );
  });
}