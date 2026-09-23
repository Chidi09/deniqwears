import React, { useState } from 'react';
import { X } from 'lucide-react';
import { GARMENT_SIZES, GarmentSize } from '../types';
import { useDialog } from '../hooks/useDialog';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// A measurement in inches; trouser length comes as a pair, shown as "20/43".
type Inches = number | [number, number];

interface SizeChartRow {
  bust: Inches;
  waist: Inches;
  hips: Inches;
  trouserLength: Inches;
  shortGownLength: Inches;
  fullLength: Inches;
}

// Measurements supplied by Deniqwears, in inches. Typed as Record<GarmentSize, …>
// so adding a size to GARMENT_SIZES fails the build until its row is filled in.
const SIZE_CHART: Record<GarmentSize, SizeChartRow> = {
  '10': { bust: 38, waist: 31, hips: 42, trouserLength: [20, 43], shortGownLength: 36, fullLength: 62 },
  '12': { bust: 40, waist: 33, hips: 44, trouserLength: [20, 43], shortGownLength: 36, fullLength: 62 },
  '14': { bust: 43, waist: 36, hips: 47, trouserLength: [20, 43], shortGownLength: 36, fullLength: 62 },
  '16': { bust: 45, waist: 39, hips: 49, trouserLength: [20, 43], shortGownLength: 36, fullLength: 62 },
  '18': { bust: 47, waist: 41, hips: 51, trouserLength: [20, 43], shortGownLength: 37, fullLength: 62 },
  '20': { bust: 49, waist: 43, hips: 53, trouserLength: [20, 43], shortGownLength: 37, fullLength: 62 },
};

const COLUMNS: { key: keyof SizeChartRow; label: string }[] = [
  { key: 'bust', label: 'Bust' },
  { key: 'waist', label: 'Waist' },
  { key: 'hips', label: 'Hips' },
  { key: 'trouserLength', label: 'Trouser length' },
  { key: 'shortGownLength', label: 'Short gown length' },
  { key: 'fullLength', label: 'Full length' },
];

const formatMeasurement = (value: Inches, unit: 'in' | 'cm') => {
  const convert = (n: number) => String(unit === 'in' ? n : Math.round(n * 2.54));
  return Array.isArray(value) ? value.map(convert).join('/') : convert(value);
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
        aria-label="Size chart"
        tabIndex={-1}
        className="relative w-full max-w-3xl bg-[#FAF9F6] border border-[#D8D4CC] p-6 sm:p-8 shadow-xl"
      >
        <div className="flex justify-between items-start border-b border-[#D8D4CC] pb-4 mb-6">
          <h3 className="font-serif text-3xl text-[#171714]">Size Chart</h3>
          <button onClick={onClose} className="p-1 text-[#171714] hover:text-[#681F2C]" aria-label="Close size chart">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Unit Toggle */}
        <div className="flex justify-between items-center mb-6 text-xs uppercase tracking-wider">
          <span className="text-[#56554F]">All measurements in {unit === 'in' ? 'inches' : 'cm'}</span>
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
              <tr className="border-b-2 border-[#171714] text-[#171714] uppercase align-bottom">
                <th className="py-2.5 pr-4">Size</th>
                {COLUMNS.map((col) => (
                  <th key={col.key} className="py-2.5 px-3">{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8D4CC] text-[#56554F]">
              {GARMENT_SIZES.map((size) => {
                const row = SIZE_CHART[size];
                return (
                  <tr key={size}>
                    <td className="py-3 pr-4 font-bold text-[#171714]">{size}</td>
                    {COLUMNS.map((col) => (
                      <td key={col.key} className="py-3 px-3 whitespace-nowrap">
                        {formatMeasurement(row[col.key], unit)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
