import React, { useId } from 'react';

/**
 * Adire motifs — the Yoruba indigo resist-dye cloth. Real adire is laid out
 * as a grid of square panels, each carrying its own motif, so the band below
 * alternates motifs panel by panel. Everything is drawn in a single colour
 * (`currentColor`) so a pattern can sit on indigo, oxblood or cream and stay
 * a quiet texture rather than decoration.
 */

export type AdireMotif = 'rings' | 'dots' | 'lattice' | 'waves';

const MOTIF_SIZE = 40;

/** One motif drawn inside a size×size square at (x, y). */
function Motif({ motif, x = 0, y = 0, size = MOTIF_SIZE }: { motif: AdireMotif; x?: number; y?: number; size?: number }) {
  const c = size / 2;
  const s = size / MOTIF_SIZE; // scale strokes with the panel
  switch (motif) {
    case 'rings':
      return (
        <g transform={`translate(${x} ${y})`} fill="none" stroke="currentColor" strokeWidth={1.4 * s}>
          <circle cx={c} cy={c} r={14 * s} />
          <circle cx={c} cy={c} r={9 * s} />
          <circle cx={c} cy={c} r={3.5 * s} fill="currentColor" stroke="none" />
          <circle cx={2 * s} cy={2 * s} r={1.6 * s} fill="currentColor" stroke="none" />
          <circle cx={size - 2 * s} cy={size - 2 * s} r={1.6 * s} fill="currentColor" stroke="none" />
        </g>
      );
    case 'dots':
      // Oniko — tie-and-dye dots with a halo
      return (
        <g transform={`translate(${x} ${y})`} stroke="currentColor" strokeWidth={1.1 * s} fill="none">
          {[
            [10, 10],
            [30, 10],
            [20, 20],
            [10, 30],
            [30, 30],
          ].map(([dx, dy]) => (
            <g key={`${dx}-${dy}`}>
              <circle cx={dx * s} cy={dy * s} r={5 * s} />
              <circle cx={dx * s} cy={dy * s} r={1.8 * s} fill="currentColor" stroke="none" />
            </g>
          ))}
        </g>
      );
    case 'lattice':
      return (
        <g transform={`translate(${x} ${y})`} stroke="currentColor" strokeWidth={1.2 * s} fill="none">
          <path d={`M${4 * s} ${4 * s}L${size - 4 * s} ${size - 4 * s}M${size - 4 * s} ${4 * s}L${4 * s} ${size - 4 * s}`} />
          <rect x={c - 6 * s} y={c - 6 * s} width={12 * s} height={12 * s} transform={`rotate(45 ${c} ${c})`} />
          <circle cx={c} cy={c} r={2 * s} fill="currentColor" stroke="none" />
        </g>
      );
    case 'waves':
      return (
        <g transform={`translate(${x} ${y})`} stroke="currentColor" strokeWidth={1.3 * s} fill="none" strokeLinecap="round">
          {[10, 20, 30].map((dy) => (
            <path
              key={dy}
              d={`M${3 * s} ${dy * s} q ${4.25 * s} ${-5 * s} ${8.5 * s} 0 t ${8.5 * s} 0 t ${8.5 * s} 0 t ${8.5 * s} 0`}
            />
          ))}
        </g>
      );
  }
}

interface AdirePatternProps {
  motif: AdireMotif;
  /** Tile size in px. */
  size?: number;
  className?: string;
}

/** A full-bleed repeating motif. Position it absolutely and set colour/opacity via className. */
export const AdirePattern: React.FC<AdirePatternProps> = ({ motif, size = MOTIF_SIZE, className = '' }) => {
  const id = useId().replace(/:/g, '');
  return (
    <svg aria-hidden className={`pointer-events-none ${className}`} width="100%" height="100%">
      <defs>
        <pattern id={`adire-${id}`} width={size} height={size} patternUnits="userSpaceOnUse">
          <Motif motif={motif} size={size} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#adire-${id})`} />
    </svg>
  );
};

const BAND_SEQUENCE: AdireMotif[] = ['rings', 'lattice', 'dots', 'waves'];

interface AdireBandProps {
  /** Panel height in px; the band is exactly this tall. */
  height?: number;
  className?: string;
}

/** A strip of adire panels, like the selvedge of the cloth — used as a section divider. */
export const AdireBand: React.FC<AdireBandProps> = ({ height = 28, className = '' }) => {
  const id = useId().replace(/:/g, '');
  const w = height * BAND_SEQUENCE.length;
  return (
    <div aria-hidden className={`w-full overflow-hidden ${className}`} style={{ height }}>
      <svg width="100%" height={height}>
        <defs>
          <pattern id={`band-${id}`} width={w} height={height} patternUnits="userSpaceOnUse">
            {BAND_SEQUENCE.map((motif, i) => (
              <g key={motif}>
                <Motif motif={motif} x={i * height} size={height} />
                <line x1={i * height} y1={0} x2={i * height} y2={height} stroke="currentColor" strokeWidth={1} opacity={0.5} />
              </g>
            ))}
          </pattern>
        </defs>
        <rect width="100%" height={height} fill={`url(#band-${id})`} />
      </svg>
    </div>
  );
};

/** Small concentric-ring mark for section labels. */
export const AdireMark: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg aria-hidden viewBox="0 0 16 16" className={`inline-block w-3.5 h-3.5 ${className}`} fill="none" stroke="currentColor">
    <circle cx="8" cy="8" r="6.5" strokeWidth="1.2" />
    <circle cx="8" cy="8" r="3.5" strokeWidth="1.2" />
    <circle cx="8" cy="8" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);
