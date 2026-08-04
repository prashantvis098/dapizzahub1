"use client";

import { useState } from "react";
import { MapPin, Loader2, RotateCw } from "lucide-react";

interface Props {
  onLocationFound: (coords: { lat: number; lng: number }) => void | Promise<void>;
}

type LocationErrorKind = "unsupported" | "permission_denied" | "timeout" | "unavailable" | "reverse_geocode_failed";

const ERROR_MESSAGES: Record<LocationErrorKind, string> = {
  unsupported: "Location isn't supported on this browser. Please enter your address manually.",
  permission_denied: "Location permission denied. Please enter your address manually, or allow location access and try again.",
  timeout: "Location request timed out. Please try again.",
  unavailable: "Couldn't determine your location. Please try again or enter your address manually.",
  reverse_geocode_failed: "Found your location, but couldn't resolve it to an address. Please enter it manually.",
};

const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0,
};

export default function CurrentLocation({ onLocationFound }: Props) {
  const [loading, setLoading] = useState(false);
  const [errorKind, setErrorKind] = useState<LocationErrorKind | null>(null);

  function handleClick() {
    if (!("geolocation" in navigator)) {
      setErrorKind("unsupported");
      return;
    }

    setLoading(true);
    setErrorKind(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          await onLocationFound({ lat: latitude, lng: longitude });
        } catch (err) {
          console.error(err);
          setErrorKind("reverse_geocode_failed");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setErrorKind("permission_denied");
        } else if (err.code === err.TIMEOUT) {
          setErrorKind("timeout");
        } else {
          setErrorKind("unavailable");
        }
      },
      GEOLOCATION_OPTIONS
    );
  }

  const isRetryable = errorKind !== null && errorKind !== "unsupported";

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading || errorKind === "unsupported"}
        className="flex items-center justify-center gap-2 w-full rounded-xl border border-white/10 bg-[#1B1B1B] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/5 disabled:opacity-60"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin text-gold" />
        ) : (
          <MapPin size={16} className="text-gold" />
        )}
        {loading ? "Fetching your location..." : "Use Current Location"}
      </button>

      {errorKind && (
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-xs text-accent">{ERROR_MESSAGES[errorKind]}</p>
          {isRetryable && (
            <button
              type="button"
              onClick={handleClick}
              className="flex shrink-0 items-center gap-1 text-xs font-semibold text-gold hover:underline"
            >
              <RotateCw size={12} /> Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
}