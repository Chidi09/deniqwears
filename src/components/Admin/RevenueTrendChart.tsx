'use client';

import React, { useState } from 'react';
import { formatMoney } from '../../lib/money';

export interface RevenuePoint {
  date: string;
  netRevenueInKobo: number;
}

interface RevenueTrendChartProps {
  series: RevenuePoint[];
}

// Single series, so identity comes from the title — no legend, no categorical
// palette. Oxblood is the only mark hue (validated for contrast on the light
// admin surface); every text element stays in ink tokens.
//
// Bars are laid out in HTML rather than a stretched SVG: a viewBox scaled with
// preserveAspectRatio="none" distorts the rounded data-ends and the 2px gaps,
// while flex children keep both exact at any container width.

const HEIGHT = 132;

function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

export const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({ series }) => {
  const [hovered, setHovered] = useState<number | null>(null);

  const max = Math.max(...series.map((point) => point.netRevenueInKobo), 1);
  const total = series.reduce((sum, point) => sum + point.netRevenueInKobo, 0);
  const peak = series.find((point) => point.netRevenueInKobo === max);

  if (total === 0) {
    return (
      <div
        className="flex items-center justify-center text-xs text-[#8A8780] border border-dashed border-[#D8D4CC]"
        style={{ height: HEIGHT }}
      >
        No revenue recorded in this period yet.
      </div>
    );
  }

  const active = hovered !== null ? series[hovered] : null;

  return (
    <div>
      {/* Readout sits above the plot so it never occludes the marks. */}
      <div className="h-7 flex items-baseline space-x-2">
        {active ? (
          <>
            <span className="text-sm font-semibold text-[#171714]">{formatMoney(active.netRevenueInKobo)}</span>
            <span className="text-xs text-[#56554F]">{formatDay(active.date)}</span>
          </>
        ) : (
          <span className="text-xs text-[#8A8780]">
            Peak {formatMoney(max)} on {formatDay(peak?.date ?? series[0].date)}
          </span>
        )}
      </div>

      <div
        className="flex items-end gap-[2px] border-b border-[#D8D4CC]"
        style={{ height: HEIGHT }}
        onMouseLeave={() => setHovered(null)}
        role="img"
        aria-label={`Daily net revenue over ${series.length} days. Total ${formatMoney(total)}, peak ${formatMoney(max)} on ${formatDay(peak?.date ?? series[0].date)}.`}
      >
        {series.map((point, index) => {
          const heightPct = (point.netRevenueInKobo / max) * 100;
          return (
            <div
              key={point.date}
              className="flex-1 h-full flex items-end cursor-default"
              onMouseEnter={() => setHovered(index)}
            >
              <div
                className="w-full rounded-t-[4px] transition-opacity"
                style={{
                  height: point.netRevenueInKobo > 0 ? `${Math.max(heightPct, 1.5)}%` : 0,
                  backgroundColor: '#681F2C',
                  opacity: hovered === null || hovered === index ? 1 : 0.35,
                }}
              />
            </div>
          );
        })}
      </div>

      <div className="flex justify-between pt-2 text-[11px] text-[#8A8780]">
        <span>{formatDay(series[0].date)}</span>
        <span>{formatDay(series[series.length - 1].date)}</span>
      </div>
    </div>
  );
};
