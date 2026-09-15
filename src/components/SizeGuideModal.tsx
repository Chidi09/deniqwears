import React, { useState } from 'react';
import { X } from 'lucide-react';
import { GARMENT_SIZES, GarmentSize } from '../types';
import { useDialog } from '../hooks/useDialog';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SizeChartRow {
  us: string;
  eu: string;
  bust: { in: string; cm: string };
  waist: { in: string; cm: string };
  hips: { in: string; cm: string };
}

// Deniq sizes are UK dress sizes. Typed as Record<GarmentSize, …> so adding a
// size to GARMENT_SIZES fails the build until its measurements are filled in.
const SIZE_CHART: Record<GarmentSize, SizeChartRow> = {
  '10': {
    us: '6',
    eu: '38',
    bust: { in: '34"', cm: '86 cm' },
    waist: { in: '27"', cm: '68 cm' },
    hips: { in: '37"', cm: '94 cm' },
  },
  '12': {
    us: '8',
    eu: '40',
    bust: { in: '36"', cm: '91 cm' },
    waist: { in: '29"', cm: '74 cm' },
    hips: { in: '39"', cm: '99 cm' },
  },
  '14': {
    us: '10',
    eu: '42',
    bust: { in: '38"', cm: '97 cm' },
    waist: { in: '31"', cm: '79 cm' },
    hips: { in: '41"', cm: '104 cm' },
  },
  '16': {
    us: '12',
    eu: '44',
    bust: { in: '40"', cm: '102 cm' },
    waist: { in: '33"', cm: '84 cm' },
    hips: { in: '43"', cm: '109 cm' },
  },
  '18': {
    us: '14',
    eu: '46',
    bust: { in: '43"', cm: '109 cm' },
    waist: { in: '36"', cm: '91 cm' },
    hips: { in: '46"', cm: '117 cm' },
  },
  '20': {
    us: '16',
    eu: '48',
    bust: { in: '45"', cm: '114 cm' },
    waist: { in: '38"', cm: '97 cm' },
    hips: { in: '48"', cm: '122 cm' },
  },
};

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose }) => {
  const [unit, setUnit] = useState<'in' | 'cm'>('in');
  const dialogRef = useDialog<HTMLDivElement>(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Size guide"
        tabIndex={-1}
        className="relative w-full max-w-2xl bg-[#FAF9F6] border border-[#D8D4CC] p-6 sm:p-8 shadow-xl"
      >
        <div className="flex justify-between items-start border-b border-[#D8D4CC] pb-4 mb-6">
          <div>
            <span className="text-[10px] tracking-[0.25em] uppercase font-semibold text-[#681F2C]">
              Atelier Measurement Guide
            </span>
            <h3 className="font-serif text-3xl text-[#171714] mt-1">Size Conversions</h3>
          </div>
          <button onClick={onClose} className="p-1 text-[#171714] hover:text-[#681F2C]" aria-label="Close size guide">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Unit Toggle */}
        <div className="flex justify-between items-center mb-6 text-xs uppercase tracking-wider">
          <span className="text-[#56554F]">Deniqwears standard body proportions</span>
          <div className="border border-[#D8D4CC] flex">
            <button
              onClick={() => setUnit('in')}
              className={`px-3 py-1 font-semibold ${unit === 'in' ? 'bg-[#171714] text-[#FAF9F6]' : 'text-[#56554F]'}`}
            >
              INCHES
            </button>
            <button
              onClick={() => setUnit('cm')}
              className={`px-3 py-1 font-semibold ${unit === 'cm' ? 'bg-[#171714] text-[#FAF9F6]' : 'text-[#56554F]'}`}
            >
              CM
            </button>
          </div>
        </div>

        {/* Size Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs tracking-wider border-collapse">
            <thead>
              <tr className="border-b-2 border-[#171714] text-[#171714] uppercase">
                <th className="py-2.5 pr-4">UK (DENIQ)</th>
                <th className="py-2.5 px-3">US</th>
                <th className="py-2.5 px-3">EU</th>
                <th className="py-2.5 px-3">BUST</th>
                <th className="py-2.5 px-3">WAIST</th>
                <th className="py-2.5 pl-3">HIPS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8D4CC] text-[#56554F]">
              {GARMENT_SIZES.map((size) => {
                const row = SIZE_CHART[size];
                return (
                  <tr key={size}>
                    <td className="py-3 pr-4 font-bold text-[#171714]">{size}</td>
                    <td className="py-3 px-3">{row.us}</td>
                    <td className="py-3 px-3">{row.eu}</td>
                    <td className="py-3 px-3">{row.bust[unit]}</td>
                    <td className="py-3 px-3">{row.waist[unit]}</td>
                    <td className="py-3 pl-3">{row.hips[unit]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Measuring Advice */}
        <div className="mt-8 p-4 bg-[#F4F1EB] border border-[#D8D4CC] text-xs text-[#56554F] space-y-2">
          <p className="font-semibold text-[#171714] uppercase tracking-wider">Fit Considerations</p>
          <p>
            Deniq garments are cut on bespoke West African and international sizing blocks. For our corset tops and bias gowns, if your measurements span two sizes, we advise selecting based on your ribcage measurement.
          </p>
          <p>
            Private showroom fitting appointments can be scheduled via our Victoria Island atelier.
          </p>
        </div>
      </div>
    </div>
  );
};
