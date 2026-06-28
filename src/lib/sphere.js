import { portfolioItems } from '../data/portfolioItems.js';

export function getServiceMatches(serviceTitle) {
  const matches = portfolioItems.filter((item) => item.serviceType === serviceTitle);
  return matches.length ? matches : portfolioItems;
}

export function getSphericalPoint(index, total) {
  if (total <= 1) {
    return { x: 0, y: 0, z: 1 };
  }

  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const y = 1 - (index / (total - 1)) * 2;
  const radius = Math.sqrt(Math.max(0, 1 - y * y));
  const theta = index * goldenAngle;

  return {
    x: Math.cos(theta) * radius,
    y,
    z: Math.sin(theta) * radius,
  };
}

export function rotatePoint(point, rotation) {
  const cosY = Math.cos(rotation.y);
  const sinY = Math.sin(rotation.y);
  const cosX = Math.cos(rotation.x);
  const sinX = Math.sin(rotation.x);

  const x1 = point.x * cosY + point.z * sinY;
  const z1 = -point.x * sinY + point.z * cosY;
  const y2 = point.y * cosX - z1 * sinX;
  const z2 = point.y * sinX + z1 * cosX;

  return { x: x1, y: y2, z: z2 };
}

export function getFrontPortfolioItem(rotation) {
  return portfolioItems.reduce(
    (front, item, index) => {
      const point = rotatePoint(getSphericalPoint(index, portfolioItems.length), rotation);

      if (point.z > front.z) {
        return { item, z: point.z };
      }

      return front;
    },
    { item: portfolioItems[0], z: -Infinity },
  ).item;
}
