/**
 * Client-side STL size estimator.
 * Parses binary or ASCII STL, returns estimated volume in cm³.
 * Price: ₹7.5/cm³ (midpoint of ₹5–10) + ₹50 base fee.
 */

export const PRICE_PER_CM3 = 7.5; // ₹
export const BASE_FEE = 50; // ₹
export const PRINT_SPEED_CM3_PER_HR = 5; // approx 5 cm³/hr

export interface SliceEstimate {
  volumeCm3: number;
  estimatedTimeHrs: number;
  priceInr: number;
}

/**
 * Compute estimate from file size (fallback heuristic when full parsing is skipped).
 * ~1 KB of STL ≈ 0.3 cm³ average part density.
 */
export const estimateFromFileSize = (fileSizeBytes: number, infillPercent: number): SliceEstimate => {
  // STL file size heuristic: each triangle is 50 bytes in binary
  const estimatedTriangles = fileSizeBytes / 50;
  // Very rough volume estimate based on triangles & infill
  const rawVolume = (estimatedTriangles / 1000) * 2.5; // cm³
  const volumeCm3 = Math.max(0.5, rawVolume * (infillPercent / 100));
  const estimatedTimeHrs = Math.max(0.25, volumeCm3 / PRINT_SPEED_CM3_PER_HR);
  const priceInr = BASE_FEE + volumeCm3 * PRICE_PER_CM3;

  return {
    volumeCm3: parseFloat(volumeCm3.toFixed(2)),
    estimatedTimeHrs: parseFloat(estimatedTimeHrs.toFixed(2)),
    priceInr: parseFloat(priceInr.toFixed(2)),
  };
};

/**
 * Parse binary STL to get triangle count and compute bounding-box volume.
 */
export const parseSTL = (buffer: ArrayBuffer, infillPercent: number): SliceEstimate => {
  try {
    const view = new DataView(buffer);
    // Binary STL: 80-byte header + 4-byte triangle count
    const triangleCount = view.getUint32(80, true);

    if (triangleCount <= 0 || triangleCount > 5_000_000) {
      throw new Error('Unlikely triangle count — probably ASCII STL');
    }

    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

    const offset = 84; // header (80) + triangle count (4)
    for (let i = 0; i < triangleCount; i++) {
      const base = offset + i * 50 + 12; // skip normal
      for (let v = 0; v < 3; v++) {
        const vBase = base + v * 12;
        const x = view.getFloat32(vBase, true);
        const y = view.getFloat32(vBase + 4, true);
        const z = view.getFloat32(vBase + 8, true);
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
        if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
      }
    }

    // Convert mm → cm, compute bounding-box volume * fill fraction
    const dxCm = (maxX - minX) / 10;
    const dyCm = (maxY - minY) / 10;
    const dzCm = (maxZ - minZ) / 10;
    const bboxVolume = dxCm * dyCm * dzCm;
    // Solid fill ratio ≈ 30% of bbox for typical parts, scaled by infill
    const fillRatio = 0.3 * (infillPercent / 100);
    const volumeCm3 = Math.max(0.5, bboxVolume * fillRatio);
    const estimatedTimeHrs = Math.max(0.25, volumeCm3 / PRINT_SPEED_CM3_PER_HR);
    const priceInr = BASE_FEE + volumeCm3 * PRICE_PER_CM3;

    return {
      volumeCm3: parseFloat(volumeCm3.toFixed(2)),
      estimatedTimeHrs: parseFloat(estimatedTimeHrs.toFixed(2)),
      priceInr: parseFloat(priceInr.toFixed(2)),
    };
  } catch {
    // Fallback for ASCII STL or parse errors
    return estimateFromFileSize(buffer.byteLength, infillPercent);
  }
};
