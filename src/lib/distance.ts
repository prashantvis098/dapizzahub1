import { BRANCHES } from "./branches";

const EARTH_RADIUS = 6371;

function toRad(value: number) {
  return (value * Math.PI) / 180;
}

export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS * c;
}

export function findNearestBranch(
  customerLat: number,
  customerLng: number
) {
  let nearest = BRANCHES[0];
  let shortestDistance = Infinity;

  BRANCHES.forEach((branch) => {
    const distance = calculateDistance(
      customerLat,
      customerLng,
      branch.lat,
      branch.lng
    );

    if (distance < shortestDistance) {
      shortestDistance = distance;
      nearest = branch;
    }
  });

  return {
    branch: nearest,
    distance: Number(shortestDistance.toFixed(2)),
    deliveryFee: shortestDistance <= 3 ? 0 : 30,
    isFreeDelivery: shortestDistance <= 3,
  };
}