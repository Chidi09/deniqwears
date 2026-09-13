import React, { useState } from 'react';
import { X } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose }) => {
  const [unit, setUnit] = useState<'in' | 'cm'>('in');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#FAF9F6] border border-[#D8D4CC] p-6 sm:p-8 shadow-xl">
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
                <th className="py-2.5 pr-4">DENIQ</th>
                <th className="py-2.5 px-3">UK</th>
                <th className="py-2.5 px-3">US</th>
                <th className="py-2.5 px-3">EU</th>
                <th className="py-2.5 px-3">BUST</th>
                <th className="py-2.5 px-3">WAIST</th>
                <th className="py-2.5 pl-3">HIPS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8D4CC] text-[#56554F]">
              <tr>
                <td className="py-3 pr-4 font-bold text-[#171714]">XS</td>
                <td className="py-3 px-3">6 - 8</td>
                <td className="py-3 px-3">2 - 4</td>
                <td className="py-3 px-3">34 - 36</td>
                <td className="py-3 px-3">{unit === 'in' ? '31 - 33"' : '79 - 84 cm'}</td>
                <td className="py-3 px-3">{unit === 'in' ? '24 - 26"' : '61 - 66 cm'}</td>
                <td className="py-3 pl-3">{unit === 'in' ? '34 - 36"' : '86 - 91 cm'}</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-bold text-[#171714]">S</td>
                <td className="py-3 px-3">8 - 10</td>
                <td className="py-3 px-3">4 - 6</td>
                <td className="py-3 px-3">36 - 38</td>
                <td className="py-3 px-3">{unit === 'in' ? '33 - 35"' : '84 - 89 cm'}</td>
                <td className="py-3 px-3">{unit === 'in' ? '26 - 28"' : '66 - 71 cm'}</td>
                <td className="py-3 pl-3">{unit === 'in' ? '36 - 38"' : '91 - 96 cm'}</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-bold text-[#171714]">M</td>
                <td className="py-3 px-3">10 - 12</td>
                <td className="py-3 px-3">6 - 8</td>
                <td className="py-3 px-3">38 - 40</td>
                <td className="py-3 px-3">{unit === 'in' ? '35 - 37"' : '89 - 94 cm'}</td>
                <td className="py-3 px-3">{unit === 'in' ? '28 - 30"' : '71 - 76 cm'}</td>
                <td className="py-3 pl-3">{unit === 'in' ? '38 - 40"' : '96 - 101 cm'}</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-bold text-[#171714]">L</td>
                <td className="py-3 px-3">12 - 14</td>
                <td className="py-3 px-3">8 - 10</td>
                <td className="py-3 px-3">40 - 42</td>
                <td className="py-3 px-3">{unit === 'in' ? '37 - 40"' : '94 - 101 cm'}</td>
                <td className="py-3 px-3">{unit === 'in' ? '30 - 33"' : '76 - 84 cm'}</td>
                <td className="py-3 pl-3">{unit === 'in' ? '40 - 43"' : '101 - 109 cm'}</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-bold text-[#171714]">XL</td>
                <td className="py-3 px-3">14 - 16</td>
                <td className="py-3 px-3">10 - 12</td>
                <td className="py-3 px-3">42 - 44</td>
                <td className="py-3 px-3">{unit === 'in' ? '40 - 43"' : '101 - 109 cm'}</td>
                <td className="py-3 px-3">{unit === 'in' ? '33 - 36"' : '84 - 91 cm'}</td>
                <td className="py-3 pl-3">{unit === 'in' ? '43 - 46"' : '109 - 117 cm'}</td>
              </tr>
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
