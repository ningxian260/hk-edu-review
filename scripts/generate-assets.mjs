import { mkdir } from "node:fs/promises";
import sharp from "sharp";

const assets = [
  ["campus-night-01.png", "拔萃男書院", "#0f766e", "#164e63"],
  ["campus-night-02.png", "聖保羅男女中學", "#0369a1", "#14532d"],
  ["campus-night-03.png", "華仁書院（九龍）", "#1d4ed8", "#334155"],
  ["campus-night-04.png", "協恩中學", "#7c3aed", "#0f766e"],
  ["campus-night-05.png", "加拿大國際學校", "#0891b2", "#4338ca"],
  ["learning-lab-01.png", "Preface Coding", "#0d9488", "#1e40af"],
  ["learning-lab-02.png", "Koding Kingdom", "#2563eb", "#166534"],
  ["learning-lab-03.png", "The Genius Workshop", "#0f766e", "#7c2d12"],
];

await mkdir("public/images", { recursive: true });

for (const [fileName, title, start, end] of assets) {
  const svg = `
    <svg width="1200" height="720" viewBox="0 0 1200 720" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="720" gradientUnits="userSpaceOnUse">
          <stop stop-color="${start}"/>
          <stop offset="1" stop-color="${end}"/>
        </linearGradient>
        <filter id="blur"><feGaussianBlur stdDeviation="42"/></filter>
      </defs>
      <rect width="1200" height="720" fill="#07111f"/>
      <rect width="1200" height="720" fill="url(#bg)" opacity="0.72"/>
      <circle cx="930" cy="118" r="210" fill="#67e8f9" opacity="0.2" filter="url(#blur)"/>
      <circle cx="240" cy="600" r="260" fill="#f8fafc" opacity="0.1" filter="url(#blur)"/>
      <g opacity="0.78">
        <rect x="122" y="270" width="180" height="260" rx="20" fill="#0f172a"/>
        <rect x="330" y="210" width="240" height="320" rx="24" fill="#111827"/>
        <rect x="604" y="300" width="170" height="230" rx="20" fill="#0f172a"/>
        <rect x="804" y="248" width="260" height="282" rx="24" fill="#111827"/>
        ${Array.from({ length: 28 }, (_, i) => {
          const x = 150 + (i % 7) * 28;
          const y = 305 + Math.floor(i / 7) * 44;
          return `<rect x="${x}" y="${y}" width="12" height="18" rx="4" fill="#67e8f9" opacity="${i % 3 === 0 ? 0.95 : 0.32}"/>`;
        }).join("")}
        ${Array.from({ length: 36 }, (_, i) => {
          const x = 372 + (i % 6) * 32;
          const y = 258 + Math.floor(i / 6) * 38;
          return `<rect x="${x}" y="${y}" width="14" height="18" rx="4" fill="#f8fafc" opacity="${i % 4 === 0 ? 0.76 : 0.24}"/>`;
        }).join("")}
        ${Array.from({ length: 30 }, (_, i) => {
          const x = 842 + (i % 6) * 34;
          const y = 294 + Math.floor(i / 6) * 42;
          return `<rect x="${x}" y="${y}" width="14" height="18" rx="4" fill="#a7f3d0" opacity="${i % 4 === 1 ? 0.82 : 0.24}"/>`;
        }).join("")}
      </g>
      <path d="M94 560C232 530 305 584 430 560C565 533 650 510 804 552C930 587 1016 573 1110 540" stroke="#e0f2fe" stroke-width="4" opacity="0.42"/>
      <text x="96" y="112" fill="#f8fafc" font-family="Arial, sans-serif" font-size="48" font-weight="700">${title}</text>
      <text x="98" y="158" fill="#cffafe" font-family="Arial, sans-serif" font-size="24">Verified education profile</text>
    </svg>
  `;

  await sharp(Buffer.from(svg)).png().toFile(`public/images/${fileName}`);
}
